t.ok(true);

setTimeout(function () {
    t.fail('never should have done this');
}, 1000);
