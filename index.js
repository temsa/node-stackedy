var burrito = require('burrito');
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

Stack.prototype.compile = function (context) {
    var self = this;
    var compiled = { emitter : new EventEmitter };
    
    if (!context) context = {};
    compiled.context = context;
    var nodes = compiled.nodes = [];
    
    var names = compiled.names = {
        call : burrito.generateName(6),
        stat : burrito.generateName(6),
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
    
    var wrapEv = function (args_) {
        var fn = args_[0];
        var stack_ = stack.slice();
        var args = [].slice.call(args_, 1);
        args.unshift(function () {
            // save the first argument to setTimeout but don't wrapNode yet
            // since wrapNode would be lots of unnecessary ops unless fn throws
            var raw = compiled.current.value[0][2][0];
            
            try {
                return fn.apply(this, arguments);
            }
            catch (err) {
                // push the wrapped first argument to setTimeout()
                var node = burrito.wrapNode({ node : raw });
                node.functionName = nameOf(node);
                
                compiled.emitter.emit('error', {
                    stack : stack.concat(node, stack_),
                    current : compiled.current,
                    message : err.message || err,
                    original : err,
                });
            }
        });
        return args;
    }
    
    var intervals = [];
    context.setInterval = function () {
        var args = wrapEv(arguments);
        var iv = setInterval.apply(this, args);
        intervals.push(iv);
        return iv;
    };
    
    context.clearInterval = function (iv) {
        var res = clearInterval.apply(this, arguments);
        var i = intervals.indexOf(iv);
        if (i >= 0) intervals.splice(i, 1);
        return res;
    };
    
    var timeouts = [];
    context.setTimeout = function () {
        var args = wrapEv(arguments);
        var to = setTimeout.apply(this, args);
        timeouts.push(to);
        return to;
    };
    
    context.clearTimeout = function (to) {
        var res = clearTimeout.apply(this, arguments);
        var i = timeouts.indexOf(to);
        if (i >= 0) timeouts.splice(i, 1);
        return res;
    };
    
    var stopped = false;
    compiled.stop = function () {
        stopped = true;
        intervals.forEach(function (iv) { clearInterval(iv) });
        timeouts.forEach(function (to) { clearTimeout(to) });
    };
    
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
    
    var ex = function (s) {
        return 'try {' + s + '}'
        + 'catch (err) { if (err !== '
            + JSON.stringify(names.stopped)
        + ') throw err }'
    };
    
    compiled.source = burrito(preSrc, function wrapper (node) {
        node.lines = lines.slice(node.start.line, node.end.line + 1);
        
        if (node.name === 'call') {
            var i = nodes.length;
            nodes.push(node);
            
            node.functionName = nameOf(node);
            node.filename = whichFile(node.start.line);
            node.wrap(names.call + '(' + i + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            var i = nodes.length;
            nodes.push(node);
            
            node.filename = whichFile(node.start.line);
            node.wrap('{' + names.stat + '(' + i + ');%s}');
        }
        else if (node.name === 'function') {
            node.wrap('(function () {'
                + ex('return (%s).apply(this, arguments)')
            + '})');
        }
        else if (node.name === 'block') {
            node.wrap('{' + ex('%s') + '}');
        }
        else if (node.name === 'defun') {
            var name = node.value[0];
            var args = node.value[1].join(',');
            var fnName = burrito.generateName(6);
            
            var src = node.source().replace(
                /function (\S+)/, 'function ' + fnName
            );
            
            node.wrap('function ' + name + '(' + args + '){'
                + ex('(%s).apply(this, arguments)')
            + '}');
        }
    });
    
    return compiled;
};

Stack.prototype.run = function (context) {
    var c = this.compile(context || {});
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
            var res = vm.runInNewContext(c.source, c.context);
            self.emit('result', res);
        }
        catch (err) {
            self.emit('error', {
                stack : c.stack,
                current : c.current,
                message : err.message || err,
                original : err,
            });
        }
    });
    
    return self;
};

var fs = require('fs');
var wrapper = null;

Stack.prototype.bundle = function () {
    var c = this.compile();
    c.names.self = burrito.generateName(6);
    
    if (!wrapper) {
        wrapper = fs.readFileSync(__dirname + '/wrapper.js', 'utf8');
    }
    
    return wrapper
        .replace(/\$body/g, function () {
            return [
                nameFunction(
                    'setTimeout',
                    c.context.setTimeout.toString()
                ),
                nameFunction(
                    'setInterval',
                    c.context.setInterval.toString()
                ),
                c.source
            ].join('\n')
        })
        .replace(/\$nodes/g, function () {
            return JSON.stringify(c.nodes)
        })
        .replace(/\$call/g, function () {
            return c.names.call
        })
        .replace(/\$stat/g, function () {
            return c.names.stat
        })
        .replace(/\$self/g, function () {
            return c.names.self
        })
        .replace(/\$setTimeout/g, function () {
            return c.names.setTimeout
        })
        .replace(/\$setInterval/g, function () {
            return c.names.setInterval
        })
    ;
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
