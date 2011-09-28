exports.blockReturn = function () {
    var x = 2 * 5 + 5;
    {
        return x / 3;
    }
};

exports.blockThrow = function () {
    var x = 2 * 5 + 5;
    {
        throw x / 3;
    }
};
