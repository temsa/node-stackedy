t.ok(true);

exports.times = 0;

function waiter () {
    exports.times ++;
}

wait(waiter);
