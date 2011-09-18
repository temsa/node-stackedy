function f () {
    function g () { h() }
    g()
}
function h () { throw 'moo' }
f();
