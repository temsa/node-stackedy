function f () { g() }
function g () { h() }
function h () {
    setTimeout(function () {
        throw 'moo'
    }, 10);
}

f();
