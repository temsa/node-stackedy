var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/caught.js', 'utf8');

test('caught', function (t) {
    var stack = stackedy(src).run();
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
    
    setTimeout(function () {
        t.end();
    }, 100);
});
