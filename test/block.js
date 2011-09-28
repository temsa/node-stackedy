var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/block.js', 'utf8');
test('return in a block', function (t) {
    t.plan(1);
    var context = { exports : {} };
    var stack = stackedy(src, { filename : 'zoom.js' }).run(context);
    t.equal(context.exports.f(), 5);
    t.end();
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
});
