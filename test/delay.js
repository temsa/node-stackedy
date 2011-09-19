var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/delay.js', 'utf8');

test('delay', function (t) {
    t.plan(5);
    var stack = stackedy(src, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 4);
        t.equal(c.current.end.line, 4);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ null, 'setTimeout', 'h', 'g', 'f' ]
        );
        
        t.end();
    });
});
