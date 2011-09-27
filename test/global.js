var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/global.js', 'utf8');

test('setTimeout context for IE9 must be window', function (t) {
    t.plan(2);
    var global = {};
    
    var to = function () {
        return setTimeout.apply(this, arguments);
    };
    to.apply = function () {
        t.equal(this, global);
    };
    
    var context = {
        done : function (n) {
            t.equal(n, 5);
            t.end();
        },
        setTimeout : to
    };
    
    var stack = stackedy(src).run(context, {
        stoppable : false,
        global : global
    });
    
    stack.on('error', function (err) {
        t.fail(err);
    });
});
