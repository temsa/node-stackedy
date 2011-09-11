var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var vm = require('vm');
var src = fs.readFileSync(__dirname + '/bundle/x.js');

test('bundle', function (t) {
    t.plan(3);
    var bundle = stackedy(src, { filename : 'zoom.js' }).bundle();
    var c = {
        t : t,
        module : { exports : {} },
        setTimeout : setTimeout,
        setInterval : setInterval,
        clearTimeout : clearTimeout,
        clearInterval : clearInterval,
        time : setTimeout(function () {
            t.fail('should have quit by now');
        }, 1000),
        finish : function () { t.end() },
        console : console,
    };
    c.exports = c.module.exports;
    vm.runInNewContext(bundle, c);
    var b = c.module.exports();
    
    var x = b.run();
    t.equal(x.foo(5), 50);
    t.equal(x.bar(5), 38);
    
    setTimeout(function () {
        b.stop();
    }, 100);
});
