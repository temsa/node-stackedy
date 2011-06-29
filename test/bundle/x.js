setTimeout(function () {
    assert.fail('should have stopped already');
}, 100000);

setTimeout(function () {
    clearTimeout(time);
}, 100);

exports.foo = function (x) {
    return x * 10;
};

exports.bar = function (x) {
    return x + 33;
};
