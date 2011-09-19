var stackedy = require('../');
var test = require('tap').test;
var path = require('path');

var t = null;
var stack = stackedy();
module.exports = function (fn, context) {
    t.ok(true);
    stack.include('(' + fn.toString() + ')()', {
        filename : context.__filename,
        context : context
    });
};

test('multifile', function (t_) {
    t = t_;
    t.plan(5);
    require('./sources/multifile/a');
    var run = stack.run();
    
    run.on('error', function (err, c) {
        run.stop();
        
        t.equal(err, 'beep boop');
        t.equal(c.current.filename, __dirname + '/multifile/b.js');
        
        t.deepEqual(
            c.stack.map(function (s) {
                return path.basename(s.filename) + ':' + s.functionName
            }),
            [ 'b.js:null', 'b.js:setTimeout', 'b.js:zzz',
                'a.js:setTimeout', 'a.js:null' ]
        );
        
        t.end();
    });
});
