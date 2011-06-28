module.exports = function () {
    var self = {
        nodes : $nodes,
        stopped : false,
        stack : [],
        start : function () {
            $body
        },
        stop : function () {
            self.stopped = true;
        }
    };
    
    function $call (i) {
        var node = node[i];
        self.stack.unshift(node);
        
        return function (expr) {
            self.stack.shift();
            return expr;
        };
    }
    
    function $stat (i) {
        if (self.stopped) throw 'stopped'
        else compiled.current = nodes[i]
    }
    
    return self;
};
