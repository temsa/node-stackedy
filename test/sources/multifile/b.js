require('./wrap')(function () {
    exports.zzz = function () {
        setTimeout(function () {
            throw 'beep boop';
        });
    };
}, { console : console, exports : exports, __filename : __filename });
