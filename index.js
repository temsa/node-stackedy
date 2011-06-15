var burrito = require('burrito');
var vm = require('vm');
var Hash = require('hashish');
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
Stack.prototype = new EventEmitter;

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

Stack.prototype.compile = function () {
    var self = this;
    var compiled = {};
    
    var context = compiled.context = {};
    var nodes = [];
    
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
    
    compiled.current = null;
    context[names.stat] = function (i) {
        compiled.current = nodes[i];
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
    if (!context) context = {};
    
    var c = this.compile();
    Hash.update(context, c.context);
    
    try {
        return vm.runInNewContext(c.source, context);
    }
    catch (err) {
        this.emit('error', {
            stack : c.stack,
            current : c.current,
            message : err.message || err,
            original : err,
        });
    }
};
