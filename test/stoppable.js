var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/stopped.js', 'utf8');

test('stoppable', function (t) {
    t.plan(1);
    var stack = stackedy('setTimeout(t.end.bind(t), 100)')
        .run(
            { t : t, setTimeout : setTimeout },
            { stoppable : false }
        );
    
    t.throws(function () {
        stack.stop();
        t.end();
    });
});
