var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var src = {
    interval : fs.readFileSync(__dirname + '/stop/interval.js'),
    timeout : fs.readFileSync(__dirname + '/stop/timeout.js'),
    wait_function : fs.readFileSync(__dirname + '/stop/wait_function.js'),
    wait_defun : fs.readFileSync(__dirname + '/stop/wait_defun.js')
};

exports.interval = function () {
    var context = { exports : {} };

    var stack = stackedy(src.interval).run(context);
    
    var x0 = null;
    setTimeout(function () {
        stack.stop();
        x0 = context.exports.times;
        assert.ok(x0 === 9 || x0 === 10);
    }, 1025);
    
    setTimeout(function () {
        assert.equal(context.exports.times, x0);
    }, 1200);
};

exports.timeout = function () {
    var context = { exports : {} };
    
    var stack = stackedy(src.timeout).run(context);
    
    setTimeout(function () {
        stack.stop();
    }, 100);
};

[ 'Function', 'Defun' ].forEach(function (name) {
    exports['wait' + name] = function () {
        var iv = null;
        var context = {
            wait : function (cb) {
                assert.ok(!iv);
                iv = setInterval(function () {
                    cb();
                }, 50);
            },
            console : console,
            exports : {}
        };
        
        var stack = stackedy(src['wait_' + name.toLowerCase()]).run(context);
        
        var x0 = null;
        setTimeout(function () {
            stack.stop();
            x0 = context.exports.times;
            assert.ok(x0 === 5 || x0 === 6);
        }, 325);
        
        setTimeout(function () {
            assert.equal(context.exports.times, x0);
            clearInterval(iv);
        }, 500);
    };
});
