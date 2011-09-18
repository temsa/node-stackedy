var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/nested.js', 'utf8');

test('nested', function (t) {
    t.plan(10);
    var stack = stackedy(src, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 4);
        t.equal(c.current.end.line, 4);
        
        t.equal(c.stack.length, 3);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.line }),
            [ 1, 2, 5 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.line }),
            [ 1, 2, 5 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.col }),
            [ 20, 4, 0 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.col }),
            [ 22, 6, 2 ]
        );
        
        t.end();
    });
});
