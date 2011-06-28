var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var stack = stackedy(src, { filename : 'stax.js' }).run();

stack.on('error', function (err) {
    console.log('Error: ' + err.message);
    
    var c = err.current;
    console.log('  in ' + c.filename + ' at line ' + c.start.line);
    
    err.stack.forEach(function (s) {
        console.log('  in ' + s.filename + ', '
            + s.functionName + '() at line ' + s.start.line
        );
    });
});
