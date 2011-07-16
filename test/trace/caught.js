function f () {
    try {
        throw 'a'
    }
    catch (err) {
        throw 'b'
    }
}

try { f() }
catch (err) {}
