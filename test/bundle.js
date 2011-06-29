var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var vm = require('vm');
var src = fs.readFileSync(__dirname + '/bundle/x.js');

exports.bundle = function () {
    var bundle = stackedy(src.calls, { filename : 'zoom.js' }).bundle();
    var c = {
        assert : assert,
        module : { exports : {} }
    };
    var b = c.exports = c.module.exports;
    vm.runInNewContext(bundle, c);
    console.dir(b);
    
    var x = b.run();
    assert.equal(x.foo(5), 50);
    assert.equal(x.bar(5), 38);
    b.stop();
};
