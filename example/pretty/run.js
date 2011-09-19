var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js', 'utf8');
var stack = stackedy(src, { filename : 'stax.js' }).run();

stack.on('error', function (err, c) {
    console.log('Error: ' + err + '\n');
    
    var cur = c.current;
    console.log('  in ' + cur.filename + ' at ' + getRange(cur) + ':');
    console.log(getCode(cur, 4));
    
    c.stack.forEach(function (s) {
        stack.stop();
        
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

function getRange (s) {
    return s.start.line === s.end.line
        ? 'line ' + (s.start.line + 1)
        : 'lines ' + (s.start.line + 1) + ' through ' + (s.end.line + 1)
    ;
}

function getCode (s, ix) {
    var lines = src.split('\n').slice(s.start.line, s.end.line + 1);
    var indent = Array(ix + 1).join(' ');
    var code = indent + lines[0].replace(/^\s+/, '');
    
    if (lines.length > 2) code += ' ... ';
    if (lines.length > 1) {
        code += lines.slice(-1)[0].replace(/^\s+/, '');
    }
    
    if (s.start.line === s.end.line) {
        var pad = ix + s.start.col - lines[0].match(/^(\s*)/)[1].length;
        code += '\n' + Array(pad + 1).join(' ')
            + Array(s.end.col - s.start.col + 2).join('~');
    }
    
    return code;
}
