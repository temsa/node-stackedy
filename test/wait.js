var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = {
    wait_function : fs.readFileSync(__dirname + '/sources/wait_function.js', 'utf8'),
    wait_defun : fs.readFileSync(__dirname + '/sources/wait_defun.js', 'utf8')
};

[ 'Function', 'Defun' ].forEach(function (name) {
    test('wait' + name, function (t) {
        t.plan(4);
        
        var iv = null;
        var context = {
            wait : function (cb) {
                t.ok(!iv);
                iv = setInterval(function () {
                    cb();
                }, 50);
            },
            exports : {},
            t : t
        };
        
        var stack = stackedy(src['wait_' + name.toLowerCase()]).run(context);
        
        var x0 = null;
        setTimeout(function () {
            stack.stop();
            x0 = context.exports.times;
            t.ok(x0 >= 3 || x0 <= 6);
        }, 325);
        
        setTimeout(function () {
            t.equal(context.exports.times, x0);
            clearInterval(iv);
            t.end();
        }, 500);
    });
});
