var burrito = require('burrito');
var json = typeof JSON === 'object' ? JSON : require('jsonify');
var vm = require('vm');
var EventEmitter = require('events').EventEmitter;

var exports = module.exports = function (src, opts) {
    if (typeof src === 'function') {
        src = '(' + src.toString() + ')()';
    }
    else if (src) {
        src = src.toString();
    }
    
    var stack = new Stack();
    if (src) stack.include(src, opts);
    return stack;
};

exports.Stack = Stack;

function Stack () {
    this.sources = [];
}

Stack.prototype.include = function (src, opts) {
    if (!opts) opts = {};
    
    if (typeof src === 'object') {
        opts = src;
    }
    else {
        opts.source = src;
    }
    
    if (!opts.filename) {
        opts.filename = '(memory#' + Math.floor(
            Math.random() * Math.pow(2,32)
        ).toString(16) + ')';
    }
    
    this.sources.push(opts);
};

Stack.prototype.compile = function (context, opts) {
    var self = this;
    var compiled = { emitter : new EventEmitter };
    
    if (!context) context = {};
    if (!opts) opts = {};
    if (opts.stoppable === undefined) opts.stoppable = true;
    
    compiled.context = context;
    var nodes = compiled.nodes = [];
    
    var names = compiled.names = {
        call : burrito.generateName(6),
        stat : burrito.generateName(6),
        fn : burrito.generateName(6),
        stopped : burrito.generateName(6),
        exception : burrito.generateName(6)
    };
    
    var stack = compiled.stack = [];
    
    context[names.call] = function (i) {
        var node = nodes[i];
        stack.unshift(node);
        
        return function (expr) {
            stack.shift();
            return expr;
        };
    };
    
    var stacks = {};
    context[names.fn] = function (ix, fn) {
        stacks[ix] = stack.slice();
        
        return function () {
            if (stack.length === 0) {
                stack.unshift(nodes[ix]);
            }
            stack.push.apply(stack, stacks[ix]);
            return fn.apply(this, arguments);
        };
    };
    
    context[names.exception] = function (id, err) {
        compiled.emitter.emit('error', err, {
            stack : stacks[id] || compiled.stack.slice(),
            current : compiled.current
        });
        return stopped;
    };
    
    var intervals = [];
    var timeouts = [];
    var stopped = false;
    
    if (opts.stoppable) {
        context.setInterval = function () {
            var iv = setInterval.apply(this, arguments);
            intervals.push(iv);
            return iv;
        };
        
        context.clearInterval = function (iv) {
            var res = clearInterval.apply(this, arguments);
            var i = intervals.indexOf(iv);
            if (i >= 0) intervals.splice(i, 1);
            return res;
        };
        
        context.setTimeout = function () {
            var to = setTimeout.apply(this, arguments);
            timeouts.push(to);
            return to;
        };
        
        context.clearTimeout = function (to) {
            var res = clearTimeout.apply(this, arguments);
            var i = timeouts.indexOf(to);
            if (i >= 0) timeouts.splice(i, 1);
            return res;
        };
        
        compiled.stop = function () {
            stopped = true;
            intervals.forEach(function (iv) { clearInterval(iv) });
            timeouts.forEach(function (to) { clearTimeout(to) });
        };
    }
    else {
        compiled.stop = function () {
            throw new Error('execution not stoppable')
        };
    }
    
    compiled.current = null;
    context[names.stat] = function (i) {
        if (stopped) throw names.stopped;
        else compiled.current = nodes[i];
    };
    
    var preSrc = (function () {
        var xs = [];
        for (var i = 0; i < self.sources.length; i++) {
            xs.push(self.sources[i].source);
        }
        return xs.join('\n');
    })();
    
    lines = preSrc.split('\n');
    
    var offsets = (function () {
        var xs = [];
        for (var i = 0; i < self.sources.length; i++) {
            var s = self.sources[i];
            xs.push(s.source.length + (xs[i-1] || 0));
        }
        return xs;
    })();
    
    function whichFile (n) {
        var sum = 0;
        for (var i = 0; i < offsets.length && n < sum; i++) {
            sum += offsets[i];
        }
        
        return self.sources[i].filename;
    }
    
    var ex = function (id, s) {
        return 'try {' + s + '}'
        + 'catch (err) {'
            + 'if (err !== ' + json.stringify(names.stopped) + ') {'
                + 'if (' + names.exception + '(' + id + ', err)) throw err'
            + '}'
        + '}'
    };
    
    function wrapper (node) {
        node.lines = lines.slice(node.start.line, node.end.line + 1);
        var ix = nodes.push(node) - 1;
        
        if (node.name === 'call') {
            node.functionName = nameOf(node);
            node.filename = whichFile(node.start.line);
            node.wrap(names.call + '(' + ix + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            node.filename = whichFile(node.start.line);
            node.wrap('{' + names.stat + '(' + ix + ');%s}');
        }
        else if (node.name === 'function') {
            node.functionName = nameOf(node);
            node.wrap(names.fn + '(' + ix + ', (function () {'
                + ex(ix, 'return (%s).apply(this, arguments)')
            + '}))');
        }
        else if (node.name === 'block') {
            node.wrap('{' + ex(ix, '%s') + '}');
        }
        else if (node.name === 'defun') {
            var name = node.value[0];
            var args = node.value[1].join(',');
            var fnName = burrito.generateName(6);
            node.functionName = name;
            
            var src = node.source().replace(
                /function (\S+)/, 'function ' + fnName
            );
            
            node.wrap('function ' + name + '(' + args + '){'
                + ex(ix, '(%s).apply(this, arguments)')
            + '}');
        }
    }
    
    try {
        compiled.source = burrito(preSrc, wrapper);
    }
    catch (err) {
        process.nextTick(function () {
            compiled.emitter.emit('error', err, {
                stack : stack.concat(node, stack_),
                current : compiled.current
            });
        });
    }
    
    return compiled;
};

Stack.prototype.run = function (context, opts) {
    if (!opts) opts = {};
    var runner = opts.runner || vm.runInNewContext;
    var c = this.compile(context || {}, opts);
    
    var self = c.emitter;
    self.current = c.current;
    self.stack = c.stack;
    
    self.stop = function () {
        self.removeAllListeners('error');
        
        c.stop();
        self.emit('stop');
    };
    
    process.nextTick(function () {
        try {
            var res = runner(
                '(function () {' + c.source + '})()',
                c.context
            );
            self.emit('result', res);
        }
        catch (err) {
            self.emit('error', err, {
                stack : c.stack.slice(),
                current : c.current
            });
        }
    });
    
    return self;
};

function nameFunction (name, src) {
    return src.replace(/^function \(/, 'function ' + name + '(');
}

function nameOf (node) {
    if (typeof node.value[0] === 'string') {
        return node.value[0];
    }
    else if (node.value[0] && typeof node.value[0][1] === 'string') {
        return node.value[0][1];
    }
    else {
        return null;
    }
}
