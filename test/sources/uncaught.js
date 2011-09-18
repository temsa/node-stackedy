function f () {
    try {
        throw 'a'
    }
    catch (err) {
        throw 'b'
    }
}

f()
