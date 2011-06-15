var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var stack = stackedy(src, { filename : 'stax.js' });

stack.on('error', function (err) {
    console.log('Error: ' + err.message + '\n');
    
    var c = err.current;
    console.log('  in ' + c.filename + ' at ' + getRange(c) + ':');
    console.log(getCode(c, 4));
    
    err.stack.forEach(function (s) {
        if (s.name === 'call') {
            
            var range = getRange(s);
            var msg = '  in ' + s.filename + ', '
                + s.functionName + '() at ' + range
            ;
            
            var code = getCode(s, 4);
            console.log(msg + ':\n' + code);
        }
    });
});

stack.run();

function getRange (s) {
    return s.start.line === s.end.line
        ? 'line ' + (s.start.line + 1)
        : 'lines ' + (s.start.line + 1) + ' through ' + (s.end.line + 1)
    ;
}

function getCode (s, ix) {
    var indent = Array(ix + 1).join(' ');
    var code = indent + s.lines[0].replace(/^\s+/, '');
    
    if (s.lines.length > 2) code += ' ... ';
    if (s.lines.length > 1) {
        code += s.lines.slice(-1)[0].replace(/^\s+/, '');
    }
    
    if (s.start.line === s.end.line) {
        var pad = ix + s.start.col - s.lines[0].match(/^(\s*)/)[1].length;
        code += '\n' + Array(pad + 1).join(' ')
            + Array(s.end.col - s.start.col + 2).join('~');
    }
    
    return code;
}
