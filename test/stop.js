var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/stop/src.js');

exports.stop = function () {
    var context = {
        setInterval : setInterval,
        console : console,
        exports : {}
    };

    var stack = stackedy(src).run(context);
    stack.on('error', function (err) {
        console.log(err.message);
    });

    setTimeout(function () {
        stack.stop();
    }, 1000);

    setInterval(function () {
        console.log(context.exports.times);
    }, 500);

};
