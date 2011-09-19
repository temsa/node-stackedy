require('./wrap')(function () {
    var b = require('./b');
console.dir(b);
    
    (function () {
console.dir(b);
        setTimeout(b.zzz, 10);
    })();
}, { console : console, require : require, __filename : __filename });
