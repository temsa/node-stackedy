var stackedy = require('../');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readdirSync(__dirname + '/trace')
    .reduce(function (acc, file) {
        var key = file.replace(/\.js$/, '');
        acc[key] = fs.readFileSync(__dirname + '/trace/' + file);
        return acc;
    }, {})
;

test('traceCalls', function (t) {
    t.plan(10);
    var stack = stackedy(src.calls, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 2);
        t.equal(c.current.end.line, 2);
        
        t.equal(c.stack.length, 3);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.col }),
            [ 16, 16, 0 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.col }),
            [ 18, 18, 2 ]
        );
        
        t.end();
    });
});

test('traceNested', function (t) {
    t.plan(10);
    var stack = stackedy(src.nested, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 4);
        t.equal(c.current.end.line, 4);
        
        t.equal(c.stack.length, 3);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'h', 'g', 'f' ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.line }),
            [ 1, 2, 5 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.line }),
            [ 1, 2, 5 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.col }),
            [ 20, 4, 0 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.col }),
            [ 22, 6, 2 ]
        );
        
        t.end();
    });
});

test('delay', function (t) {
    t.plan(5);
    var stack = stackedy(src.delay, { filename : 'zoom.js' }).run();
    
    stack.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 4);
        t.equal(c.current.end.line, 4);
        
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'setTimeout', 'h', 'g', 'f' ]
        );
        
        t.end();
    });
});

test('nestDelay', function (t) {
    t.plan(2);
    var stack = stackedy(src.nest_delay).run();
    
    stack.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'yyy', 'xxx', 'setTimeout', 'h', 'g', 'f' ]
        );
        t.end();
    });
});

test('caught', function (t) {
    var stack = stackedy(src.caught).run();
    
    stack.on('error', function (err, c) {
        t.fail(err);
    });
    
    setTimeout(function () {
        t.end();
    }, 100);
});

test('uncaught', function (t) {
    t.plan(2);
    var stack = stackedy(src.uncaught).run();
    
    stack.on('error', function (err, c) {
        t.equal(err, 'b');
        t.deepEqual(
            c.stack.map(function (s) { return s.functionName }),
            [ 'f' ]
        );
        t.end();
    });
});
