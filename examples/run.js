var stackedy = require('stackedy');

var s = stackedy('(' + (function () {
    //undefined.name;
    
    function f () { g() }
    function g () { h() }
    function h () { throw 'moo' }
    
    f();
}).toString() + ')()');

s.on('error', function (err) {
    console.log(err.message);
    
    err.stack.forEach(function (s) {
        if (s.name === 'call') {
            var fnName = s.value[0][1] || 'anonymous';
            var msg = ' at function ' + fnName + '()'
                + ' -> line ' + s.start.line + ', column ' + s.start.col;
            if (s.start.line !== s.end.line) {
                msg += ' to line ' + s.end.line + ', column ' + s.end.col;
            }
            else if (s.start.col !== s.end.col) {
                msg += ' to column ' + s.end.col;
            }
            
            console.log(msg);
        }
    });
});
