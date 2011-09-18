var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/stopped.js', 'utf8');

test('stopped', function (t) {
    t.plan(2);
    var stack = stackedy(src).run({ t : t });
    
    stack.on('error', function (err) {
        t.equal(err, 'stopped');
        t.end();
    });
});
