var stackedy = require('stackedy');

var s = stackedy('(' + (function () {
    //undefined.name;
    
    function f () { g() }
    function g () { h() }
    function h () { throw 'moo' }
    
    f();
}).toString() + ')()')

s.on('error', function (err) {
    console.dir(err.stack);
});
