require('../../multifile')(function () {
    var b = require('./b');
    
    (function () {
        setTimeout(b.zzz, 10);
    })();
}, { require : require, __filename : __filename });
