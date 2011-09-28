var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/block.js', 'utf8');

test('return in a block', function (t) {
    t.plan(1);
    var context = { exports : {} };
    var stack = stackedy(src).run(context);
    
    process.nextTick(function () {
        t.equal(context.exports.blockReturn(), 5);
        t.end();
    });
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
});

test('throw in a block', function (t) {
    var context = { exports : {} };
    var stack = stackedy(src).run(context);
    
    process.nextTick(function () {
        context.exports.blockThrow();
    });
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.equal(err, 5);
        t.equal(c.current.start.line, 10);
        t.end();
    });
});
