var stackedy = require('stackedy');

var src = [
    'function f () { g() }',
    'function g () { h() }',
    'function h () { throw "moo" }',
    'f();'
].join('\n');

window.onload = function () {
    var stack = stackedy(src, { filename : 'stax.js' }).run();
    stack.once('error', function (err, c) {
        stack.stop();
        write('Error: ' + err);
        
        var cur = c.current;
        
        write('  in ' + cur.filename + ' at line ' + cur.start.line);
        
        for (var i = 0; i < c.stack.length; i++) {
            var s = c.stack[i];
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
