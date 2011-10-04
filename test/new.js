var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/new.js', 'utf8');

test('new', function (t) {
    var context = { module : { exports : {} } };
    var stack = stackedy(src).run(context);
    
    process.nextTick(function () {
        var doom = context.module.exports;
        t.equal(doom(3).gloom(10), 13);
        t.end();
    });
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.fail(err);
    });
});
