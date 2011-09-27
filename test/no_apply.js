var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/no_apply.js', 'utf8');

test('setTimeout has no .apply in the IEs', function (t) {
    t.plan(1);
    var to = function () {
        return setTimeout.apply(this, arguments);
    };
    to.apply = null;
    
    var context = {
        done : function (n) {
            t.equal(n, 5);
            t.end();
        },
        setTimeout : to
    };
    
    var stack = stackedy(src).run(context, { stoppable : false });
    stack.on('error', function (err) {
        t.fail(err);
    });
});
