var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/global.js', 'utf8');

test('setTimeout context for IE9 must be window', function (t) {
    t.plan(2);
    var global = {};
    
    var to = function () {
        t.fail('should have been called with .apply()')
    };
    
    to.apply = function () {
        t.equal(arguments[0], global);
        return setTimeout.apply.apply(setTimeout, arguments);
    };
    
    var context = {
        done : function (n) {
            t.equal(n, 5);
            t.end();
        },
        setTimeout : to,
        console : console
    };
    
    var stack = stackedy(src).run(context, {
        stoppable : false,
        global : global
    });
    
    stack.on('error', function (err) {
        t.fail(err);
    });
});
