module.exports = function () {
    var $self = module.exports = {
        nodes : $nodes,
        current : null,
        stopped : false,
        stack : [],
        run : function () {
            var module = { exports : {} };
            var exports = module.exports;
            
            $body
            
            return module.exports;
        },
        stop : function () {
            $self.stopped = true;
        }
    };
    
    function $call (i) {
        var node = $self.nodes[i];
        $self.stack.unshift(node);
        
        return function (expr) {
            $self.stack.shift();
            return expr;
        };
    }

    function $stat (i) {
        if ($self.stopped) throw 'stopped'
        else $self.current = $self.nodes[i]
    }
    
    return $self;
};
