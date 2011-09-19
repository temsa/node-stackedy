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
        defun : burrito.generateName(6),
        stopped : burrito.generateName(6),
        exception : burrito.generateName(6)
    };
    
    var stack = compiled.stack = [];
    var stacks = {};
    
    context[names.call] = function (ix, that, fn, args) {
        var node = nodes[ix];
        stack.unshift(node);
        var stack_ = stacks[ix] = stack.slice();
        
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typeof arg === 'function') {
                args[i] = (function (f) {
                    return function () {
                        stack = stack_;
                        return f.apply(this, arguments);
                    };
                })(arg);
            }
        }
        
        if (that) {
            var res = that[fn].apply(that, args);
        }
        else {
            fn.apply(that, args);
        }
        stack.shift();
        return res;
    };
    
    context[names.fn] = function (ix, fn) {
        var node = nodes[ix];
        
        return function () {
            stack.unshift(node);
            var res = fn.apply(this, arguments);
            stack.shift();
            return res;
        };
    };
    
    context[names.defun] = function (ix, fn) {
        var node = nodes[ix];
        stack.unshift(node);
        return function () {
            var res = fn.apply(this, arguments);
            stack.shift();
            return res;
        };
    };
    
    context[names.exception] = function (ix, err) {
        compiled.emitter.emit('error', err, {
            stack : stacks[ix] || stack.slice(),
            current : compiled.current
        });
        return !stopped;
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
    
    var ex = function (ix, s) {
        return 'try {' + s + '}'
        + 'catch (err) {'
            + 'if (err !== ' + json.stringify(names.stopped) + ') {'
                + 'if (' + names.exception + '(' + ix + ', err)) throw err'
            + '}'
        + '}'
    };
    
    function wrapper (node) {
        node.lines = lines.slice(node.start.line, node.end.line + 1);
        var ix = nodes.push(node) - 1;
        
        if (node.name === 'call') {
            node.functionName = burrito.label(node);
            node.filename = whichFile(node.start.line);
            
            var that = null;
            var fn = null;
            
            if (node.value[0][0] === 'name') {
                fn = node.value[0][1];
                that = null;
            }
            else if (node.value[0][0] === 'dot') {
                fn = json.stringify(node.value[0][node.value[0].length-1]);
                that = burrito(node.value[0][1], wrapper).replace(/;$/, '');
            }
            else if (node.value[0][0].name) {
                fn = burrito(
                    [ node.value[0][0].name ].concat(node.value[0].slice(1)),
                    wrapper
                ).replace(/;$/, '');
            }
            else {
                fn = burrito(node.value[0], wrapper).replace(/;$/, '');
                that = null;
            }
            var args = burrito([ 'array', node.value[1] ], wrapper)
                .replace(/;$/, '');
            node.wrap(
                names.call + '(' + ix + ',' + that + ',' + fn + ',' + args + ')'
            );
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            node.filename = whichFile(node.start.line);
            node.wrap('{' + names.stat + '(' + ix + ');%s}');
        }
        else if (node.name === 'function') {
            node.functionName = burrito.label(node);
            node.wrap('(function () {'
                + ex(ix, 'return ' + names.fn
                    + '(' + ix + ',%s).apply(this, arguments)'
                )
            + '})');
        }
        else if (node.name === 'block') {
            node.wrap('{' + ex(ix, '%s') + '}');
        }
        else if (node.name === 'defun') {
            var name = node.value[0];
            var vars = node.value[1].join(',');
            node.functionName = name;
            
            node.wrap('function ' + name + '(' + vars + '){'
                + ex(ix, 'return (%s).apply(this, arguments)')
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
        self.on('error', function () {});
        
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
