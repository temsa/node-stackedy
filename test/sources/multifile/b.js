require('../../multifile')(function () {
    exports.zzz = function () {
        setTimeout(function () {
            throw 'beep boop';
        });
    };
}, { exports : exports, __filename : __filename });
