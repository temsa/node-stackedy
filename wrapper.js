module.exports = function () {
    var $self = module.exports = {
        nodes : $nodes,
        current : null,
        stopped : false,
        stack : [],
        setTimeout : setTimeout,
        setInterval : setInterval,
        timeouts : [],
        intervals : [],
        run : function () {
            var module = { exports : {} };
            var exports = module.exports;
            
            var setTimeout = function () {
                var to = $self.setTimeout.apply(this, arguments);
                $self.timeouts.push(to);
                return to;
            };
            
            var setInterval = function () {
                var iv = $self.setInterval.apply(this, arguments);
                $self.intervals.push(iv);
                return iv;
            };
            
            $body
            
            return module.exports;
        },
        stop : function () {
            $self.stopped = true;
            $self.intervals.forEach(function (iv) { clearInterval(iv) });
            $self.timeouts.forEach(function (to) { clearTimeout(to) });
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
