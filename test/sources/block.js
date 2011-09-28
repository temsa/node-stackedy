exports.blockReturn = function () {
    var x = 2 * 5 + 5;
    {
        return x / 3;
    }
};
