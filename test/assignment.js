var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/assignment.js', 'utf8');
test('assignment', function (t) {
    var stack = stackedy(src).run();
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
    
    process.nextTick(function () {
        t.end();
    });
});
