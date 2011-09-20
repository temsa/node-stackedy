var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/cb.js', 'utf8');

test('cb', function (t) {
    t.plan(7);
    var stack = stackedy(src).run({
        fn : function (name, cb) {
            t.equal(name, 'quoymielle')
            cb({
                ok : t.ok.bind(t),
                equal : t.equal.bind(t),
                end : function () {
                    t.ok(stack.current);
                    t.equal(stack.current.source(), 't.end();');
                    t.end();
                },
                wuxxet : function (x, cb) {
                    t.equal(x, 'flibble');
                    cb('kallisti');
                }
            });
        }
    });
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
});
