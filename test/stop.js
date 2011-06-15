var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var src = {
    interval : fs.readFileSync(__dirname + '/stop/interval.js'),
    timeout : fs.readFileSync(__dirname + '/stop/timeout.js')
};

exports.interval = function () {
    var context = {
        setInterval : setInterval,
        console : console,
        exports : {}
    };

    var stack = stackedy(src.interval).run(context);
    
    setTimeout(function () {
        stack.stop();
        assert.equal(context.exports.times, 9);
    }, 1000);
    
    setTimeout(function () {
        assert.equal(context.exports.times, 9);
    }, 1200);
};

exports.timeout = function () {
    var context = {
        setInterval : setInterval,
        console : console,
        exports : {}
    };
    
    var stack = stackedy(src.timeout).run(context);
    
    setTimeout(function () {
        stack.stop();
    }, 100);
};
