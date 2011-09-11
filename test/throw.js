var test = require('tap').test;
var stackedy = require('../');

var fs = require('fs');
var src = fs.readdirSync(__dirname + '/throw')
    .reduce(function (acc, file) {
        var key = file.replace(/\.js$/, '');
        acc[key] = fs.readFileSync(__dirname + '/throw/' + file);
        return acc;
    }, {})
;

test('throw in a setTimeout', function (t) {
    t.plan(2);
    var stack = stackedy(src.timeout).run({
        t : t,
        to : setTimeout
    });
    console.log(stackedy(src.timeout).compile().source);
    
    stack.on('error', function (err) {
        t.equal(err.message, 'beep');
        t.end();
    });
});
