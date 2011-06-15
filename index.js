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
    var compiled = {};
    
    if (!context) context = {};
    compiled.context = context;
    var nodes = compiled.nodes = [];
    
    var names = compiled.names = {
        call : burrito.generateName(6),
        stat : burrito.generateName(6)
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
    
    var intervals = [];
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
    
    var timeouts = [];
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
    
    var stopped = false;
    compiled.stop = function () {
        stopped = true;
        intervals.forEach(function (iv) { clearInterval(iv) });
        timeouts.forEach(function (to) { clearTimeout(to) });
    };
    
    compiled.current = null;
    context[names.stat] = function (i) {
        if (stopped) throw 'stopped'
        else compiled.current = nodes[i];
    };
    
    var preSrc = self.sources.map(function (s) {
        return s.source
    }).join('\n');
    
    lines = preSrc.split('\n');
    
    var offsets = self.sources.reduce(function (acc, s, i) {
        return acc.push(s.source.length + (acc[i-1] || 0));
    }, []);
    
    function whichFile (n) {
        var sum = 0;
        for (var i = 0; i < offsets.length && n < sum; i++) {
            sum += offsets[i];
        }
        
        return self.sources[i].filename;
    }
    
    compiled.source = burrito(preSrc, function (node) {
        node.lines = lines.slice(node.start.line, node.end.line + 1);
        
        if (node.name === 'call') {
            var i = nodes.length;
            nodes.push(node);
            
            node.functionName = node.value[0][1] || 'anonymous';
            
            node.filename = whichFile(node.start.line);
            node.wrap(names.call + '(' + i + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            var i = nodes.length;
            nodes.push(node);
            
            node.filename = whichFile(node.start.line);
            node.wrap('{' + names.stat + '(' + i + ');%s}');
        }
    });
    
    return compiled;
};

Stack.prototype.run = function (context) {
    var c = this.compile(context || {});
    var self = new EventEmitter;
    
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
