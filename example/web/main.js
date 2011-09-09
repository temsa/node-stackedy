var stackedy = require('stackedy');

var src = [
    'function f () { g() }',
    'function g () { h() }',
    'function h () { throw "moo" }',
    'f();'
].join('\n');

window.onload = function () {
    var stack = stackedy(src, { filename : 'stax.js' });
    var runner = stack.run();
    runner.on('error', function (err) {
        write('Error: ' + err.message);
        
        var c = err.current || err.stack[0] || { start : {}, stack : [] };
        write('  in ' + c.filename + ' at line ' + c.start.line);
        
        for (var i = 0; i < err.stack.length; i++) {
            var s = err.stack[i];
            write('  in ' + s.filename + ', '
                + s.functionName + '() at line ' + s.start.line
            );
        }
    });
};
if (document.readyState === 'complete') window.onload();

function write (msg) {
    document.getElementById('output').innerHTML += msg + '\n';
}
