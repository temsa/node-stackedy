var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/trace/src.js');

exports.trace = function () {
    var stack = stackedy(src, { filename : 'zoom.js' }).run();
    var to = setTimeout(function () {
        assert.fail('never caught error')
    }, 5000);
    
    stack.on('error', function (err) {
        clearTimeout(to);
        
        assert.equal(err.message, 'moo');
        assert.equal(err.current.filename, 'zoom.js');
        assert.equal(err.current.start.line, 2);
        assert.equal(err.current.end.line, 2);
        
        assert.equal(err.stack.length, 3);
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.start.line }),
            [ 1, 0, 4 ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.end.line }),
            [ 1, 0, 4 ]
        );
    });
};
