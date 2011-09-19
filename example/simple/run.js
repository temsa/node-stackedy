var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var stack = stackedy(src, { filename : 'stax.js' }).run();

stack.on('error', function (err, c) {
    stack.stop();
    console.log('Error: ' + err);
    
    var cur = c.current;
    console.log('  in ' + cur.filename + ' at line ' + cur.start.line);
    
    c.stack.forEach(function (s) {
        console.log('  in ' + s.filename + ', '
            + s.functionName + '() at line ' + s.start.line
        );
    });
});
