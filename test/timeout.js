var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/timeout.js', 'utf8');

test('timeout', function (t) {
    t.plan(1);
    var context = { exports : {}, t : t };
    
    var stack = stackedy(src).run(context);
    
    setTimeout(function () {
        stack.stop();
        t.end();
    }, 100);
});
