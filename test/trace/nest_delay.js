function f () { g() }
function g () { h() }
function h () {
    setTimeout(function xxx () {
        (function yyy () {
            throw 'moo'
        })()
    }, 10);
}

f();
