stackedy
========

Roll your own stack traces and control program execution through AST
manipulation.

examples
========

simple custom stacktrace
------------------------

examples/simple/run.js:

````javascript
var stackedy = require('stackedy');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/src.js');
var stack = stackedy(src, { filename : 'stax.js' }).run();

stack.on('error', function (err) {
    console.log('Error: ' + err.message);
    
    var c = err.current;
    console.log('  in ' + c.filename + ' at line ' + c.start.line);
    
    err.stack.forEach(function (s) {
        console.log('  in ' + s.filename + ', '
            + s.functionName + '() at line ' + s.start.line
        );
    });
});
````

output:

    Error: moo
      in stax.js at line 2
      in stax.js, h() at line 1
      in stax.js, g() at line 0
      in stax.js, f() at line 4

methods
=======

````javascript
var stackedy = require('stackedy');
````

var stack = stackedy(src='', opts={})
-------------------------------------

Create a new stack object.

stack.include(src, opts={})
---------------------------

Include a source file body `src` into the current bundle.

`opts` can specify a `'filename'` key to augment the stack parameters with
filenames.

stack.run(context={})
---------------------

Execute the compiled source with the given context using `vm.runInNewContext()`.

stack.compile(context={})
-------------------------

Compile the sources into a single file with the transformations in place.

Returns an object with source, augmented context, current and others.
