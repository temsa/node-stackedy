var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/uncaught.js', 'utf8');

test('uncaught', function (t) {
    t.plan(2);
    var stack = stackedy(src).run();
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.equal(err, 'b');
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'f' ]
        );
        t.end();
    });
});
