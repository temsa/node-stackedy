var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/runner.js', 'utf8');
test('runner', function (t) {
    t.plan(11);
    var stack = stackedy(src, { filename : 'zoom.js' }).run({}, {
        runner : function (s, context) {
            t.ok(s.length > src.length);
            
            var keys = Object.keys(context);
            var args = keys.map(function (key) {
                return context[key];
            });
            return Function(keys, s).apply(null, args);
        }
    });
    
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
