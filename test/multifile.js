var test = require('tap').test;
var path = require('path');

var stack = require('./sources/multifile/wrap').stack;

test('multifile', function (t) {
    t.plan(3);
    require('./sources/multifile/a');
    var run = stack.run();
    
    run.on('error', function (err, c) {
console.log('CAUGHT!');
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
