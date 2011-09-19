var stackedy = require('../');
var test = require('tap').test;
var path = require('path');
var fs = require('fs');

test('multifile', function (t) {
    t.plan(3);
    
    var stack = stackedy();
    [ 'b.js', 'a.js' ].forEach(function (name) {
        var src = fs.readFileSync(__dirname + '/sources/multifile/' + name);
        stack.include(src.toString(), {
            filename : './' + name,
            postFilter : function (s) {
                return 'define('
                    + [ name, s ].map(JSON.stringify).join(',')
                    + ')'
                ;
            }
        });
    });
    
    var modules = {};
    var run = stack.run({
        define : function (name, src) {
            var ctx = {};
            Object.keys(run.context).forEach(function (key) {
                ctx[key] = run.context[key];
            });
            
            ctx.require = function (file) {
                return modules[file];
            };
            ctx.exports = {};
            
            var keys = Object.keys(ctx);
            var args = keys.map(function (key) { return ctx[key] });
            Function(keys, src).apply(null, args);
            modules['./' + name] = ctx.exports;
        },
    });
    
    run.on('error', function (err, c) {
        run.stop();
        
        t.equal(err, 'beep boop');
        t.equal(c.current.filename, './b.js');
        
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
