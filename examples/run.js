var stackedy = require('stackedy');
var sprintf = require('sprintf').sprintf;

var src = '(' + (function () {
    //undefined.name;
    
    function f () { g() }
    function g () { h() }
    function h () { throw 'moo' }
    
    f();
}).toString() + ')()';

var stack = stackedy(src, { filename : 'stax.js' });

stack.on('error', function (err) {
    console.log(err.message + '\n');
    
    err.stack.forEach(function (s) {
        if (s.name === 'call') {
            
            var msg = ' in ' + s.functionName + '()'
                + ' -> line ' + s.start.line + ', column ' + s.start.col;
            if (s.start.line !== s.end.line) {
                msg += ' to line ' + s.end.line + ', column ' + s.end.col;
            }
            else if (s.start.col !== s.end.col) {
                msg += ' to column ' + s.end.col;
            }
            
            var code = '  ' + sprintf('%4d', s.start.line) + ' : '
                + s.lines[0].replace(/^\s+/, '')
            ;
            
            if (s.lines.length > 2) code += ' ... ';
            if (s.lines.length > 1) {
                code += s.lines.slice(-1)[0].replace(/^\s+/, '');
            }
            
            console.log(msg + ':\n' + code + '\n');
        }
    });
});

stack.run();
