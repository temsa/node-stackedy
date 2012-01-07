var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/function_properties.js', 'utf8');
test('function properties', function (t) {
    t.plan(1);
    var stack = stackedy(src).run({
        ap : function (f, g) {
            t.equal(f(g), 5);
            t.end();
        }
    });
    
    stack.on('error', function (err, c) {
        stack.stop();
        t.fail(err);
    });
});
