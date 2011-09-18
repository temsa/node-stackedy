to(function () {
    t.ok(true);
    throw 'beep'
    t.fail('should never get here');
}, 50)
