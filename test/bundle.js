var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var vm = require('vm');
var src = fs.readFileSync(__dirname + '/bundle/x.js');

exports.bundle = function () {
    var bundle = stackedy(src, { filename : 'zoom.js' }).bundle();
    var c = {
        assert : assert,
        module : { exports : {} },
        setTimeout : setTimeout,
        setInterval : setInterval,
        clearTimeout : clearTimeout,
        clearInterval : clearInterval,
        time : setTimeout(function () {
            assert.fail('timeout never cleared in the x setTimeout')
        }, 2000),
        console : console,
    };
    c.exports = c.module.exports;
    vm.runInNewContext(bundle, c);
    var b = c.module.exports();
    
    var x = b.run();
    assert.equal(x.foo(5), 50);
    assert.equal(x.bar(5), 38);
    
    setTimeout(function () {
        b.stop();
    }, 100);
};
