var burrito = require('burrito');
var vm = require('vm');
var EventEmitter = require('events').EventEmitter;

var stackedy = module.exports = function (src) {
    var self = new EventEmitter;
    
    var stack = stackedy.stack(src);
    
    process.nextTick(function () {
        try {
            vm.runInNewContext(stack.source, stack.context);
        }
        catch (err) {
            self.emit('error', {
                stack : stack.stack,
                message : err.message,
                original : err,
            });
        }
    });
    
    return self;
};

stackedy.stack = function (src) {
    var nodes = [];
    
    var names = {
        call : burrito.generateName(6),
        stat : burrito.generateName(6),
    };
    
    var context = {};
    
    var stack = [];
    context[names.call] = function (i) {
        var node = nodes[i];
        stack.push(node);
        
        return function (expr) {
            stack.pop();
            return expr;
        };
    };
    
    var cur = null;
    context[names.stat] = function (i) {
        cur = nodes[i];
    };
    
    var source = burrito(src, function (node) {
        if (node.name === 'call') {
            var i = nodes.length;
            nodes.push(node);
            
            node.wrap(names.call + '(' + i + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw') {
            var i = nodes.length;
            nodes.push(node);
            
            node.wrap(names.stat + '(' + i + ');%s');
        }
    });
    
    return {
        source : source,
        context : context,
        stack : stack,
        nodes : nodes,
    };
};
