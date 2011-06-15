var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var stack = stackedy(src, { filename : 'stax.js' });

stack.on('error', function (err) {
    console.log('Error: ' + err.message + '\n');
    
    err.stack.forEach(function (s) {
        if (s.name === 'call') {
            
            var range = s.start.line === s.end.line
                ? 'line ' + s.start.line
                : 'lines ' + s.start.line + ' through ' + s.end.line
            ;
            
            var msg = '  in ' + s.filename + ', '
                + s.functionName + '() at ' + range
            ;
            
            var code = '    ' + s.lines[0].replace(/^\s+/, '');
            
            if (s.lines.length > 2) code += ' ... ';
            if (s.lines.length > 1) {
                code += s.lines.slice(-1)[0].replace(/^\s+/, '');
            }
            
            console.log(msg + ':\n' + code);
            
            if (s.start.line === s.end.line) {
                var pad = 4 + s.start.col - s.lines[0].match(/^(\s*)/)[1].length;
                console.log(
                    Array(pad + 1).join(' ')
                    + Array(s.end.col - s.start.col + 2).join('~')
                );
            }
            else {
                console.log();
            }
        }
    });
});

stack.run();
