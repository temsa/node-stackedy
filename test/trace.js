var stackedy = require('../');
var assert = require('assert');

var fs = require('fs');
var src = {
    calls : fs.readFileSync(__dirname + '/trace/calls.js'),
    nested : fs.readFileSync(__dirname + '/trace/nested.js')
};

exports.traceCalls = function () {
    var stack = stackedy(src.calls, { filename : 'zoom.js' }).run();
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
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.start.col }),
            [ 16, 16, 0 ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.end.col }),
            [ 18, 18, 2 ]
        );
    });
};

exports.traceNested = function () {
    var stack = stackedy(src.nested, { filename : 'zoom.js' }).run();
    var to = setTimeout(function () {
        assert.fail('never caught error')
    }, 5000);
    
    stack.on('error', function (err) {
        clearTimeout(to);
        
        assert.equal(err.message, 'moo');
        assert.equal(err.current.filename, 'zoom.js');
        assert.equal(err.current.start.line, 4);
        assert.equal(err.current.end.line, 4);
        
        assert.equal(err.stack.length, 3);
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.start.line }),
            [ 1, 2, 5 ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.end.line }),
            [ 1, 2, 5 ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.start.col }),
            [ 20, 4, 0 ]
        );
        
        assert.deepEqual(
            err.stack.map(function (s) { return s.end.col }),
            [ 22, 6, 2 ]
        );
    });
};
