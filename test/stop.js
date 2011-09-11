var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readdirSync(__dirname + '/stop')
    .reduce(function (acc, file) {
        var key = file.replace(/\.js$/, '');
        acc[key] = fs.readFileSync(__dirname + '/stop/' + file);
        return acc;
    }, {})
;

test('interval', function (t) {
    t.plan(3);
    var context = { exports : {}, t : t };
    var stack = stackedy(src.interval).run(context);
    
    var x0 = null;
    setTimeout(function () {
        stack.stop();
        x0 = context.exports.times;
        t.ok(x0 >= 200 / 25 - 2 && x0 <= 200 / 25);
    }, 200);
    
    setTimeout(function () {
        t.equal(context.exports.times, x0);
        t.end();
    }, 400);
});

test('timeout', function (t) {
    t.plan(1);
    var context = { exports : {}, t : t };
    
    var stack = stackedy(src.timeout).run(context);
    
    setTimeout(function () {
        stack.stop();
        t.end();
    }, 100);
});

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
            console : console,
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

test('stopped', function (t) {
    t.plan(2);
    var stack = stackedy(src.stopped).run({ t : t });
    
    stack.on('error', function (err) {
        t.equal(err.message, 'stopped');
        t.end();
    });
});
