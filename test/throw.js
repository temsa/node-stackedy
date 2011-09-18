var test = require('tap').test;
var stackedy = require('../');

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/throw.js');

test('throw in a setTimeout', function (t) {
    t.plan(2);
    var stack = stackedy(src).run({
        t : t,
        to : setTimeout
    });
    
    stack.on('error', function (err) {
        stack.stop();
        t.equal(err, 'beep');
        t.end();
    });
});
