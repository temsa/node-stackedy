var fn = function () {}
fn.x = 5;

function g (f) { return f.x }

ap(g, fn);
