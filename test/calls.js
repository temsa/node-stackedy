var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/calls.js', 'utf8');
test('calls', function (t) {
    t.plan(10);
    var stack = stackedy(src, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        stack.stop();
        
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 2);
        t.equal(c.current.end.line, 2);
        
        t.equal(c.stack.length, 3);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.col }),
            [ 16, 16, 0 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.col }),
            [ 18, 18, 2 ]
        );
        
        t.end();
    });
});
