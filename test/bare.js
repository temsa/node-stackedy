var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/bare.js', 'utf8');

test('bare throw', function (t) {
    t.plan(2);
    var context = { exports : {} };
    var stack = stackedy(src).run(context);
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.equal(err, 'doom');
        t.equal(c.current.start.line, 0);
        t.end();
    });
});
