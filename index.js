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
    if (typeof src === 'object') {
        opts = src;
    }
    else {
        opts.source = src;
    }
    
    this.sources.push(opts);
};

Stack.prototype.runner = function (context, runner) {
    var self = this;
    
    if (typeof context === 'function') {
        cb = context;
        context = cb;
    }
    if (!context) context = {};
    
    var nodes = [];
    
    var names = {
        call : burrito.generateName(6),
        stat : burrito.generateName(6),
    };
    
    var stack = [];
    
    context[names.call] = function (i) {
        var node = nodes[i];
        stack.unshift(node);
        
        return function (expr) {
            stack.shift();
            return expr;
        };
    };
    
    var current = null;
    context[names.stat] = function (i) {
        cur = nodes[i];
    };
    
    var preSrc = self.sources.map(function (s) {
        return s.source
    }).join('\n');
    
    self.lines = preSrc.split('\n');
    
    var postSrc = burrito(preSrc, function (node) {
        node.lines = self.lines.slice(node.start.line, node.end.line + 1);
        
        if (node.name === 'call') {
            var i = nodes.length;
            nodes.push(node);
            
            node.functionName = node.value[0][1] || 'anonymous';
            
            node.wrap(names.call + '(' + i + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            var i = nodes.length;
            nodes.push(node);
            
            node.wrap(names.stat + '(' + i + ');%s');
        }
    });
    
    try {
        return runner(postSrc, context);
    }
    catch (err) {
        self.emit('error', {
            stack : stack,
            message : err.message || err,
            original : err,
        });
    }
};

Stack.prototype.run = function (context) {
    return this.runner(context, function (src, c) {
        return vm.runInNewContext(src, c);
    });
};
