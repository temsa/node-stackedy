var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/cb.js', 'utf8');

test('cb', function (t) {
    t.plan(5);
    var stack = stackedy(src).run({
        fn : function (name, cb) {
            t.equal(name, 'quoymielle')
            cb({
                ok : t.ok.bind(t),
                equal : t.equal.bind(t),
                end : t.end.bind(t),
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
