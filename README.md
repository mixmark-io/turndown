# to-markdown

An HTML to Markdown converter written in javascript.

## Running in the browser (requires jQuery)

Include the script, and then:

    var converter = toMarkdown.converter();
    converter.makeMd('<h1>Hello world!</h1>'); // '# Hello world'

## Running under Node.js

to-markdown can also be run under Node.js. Install it via NPM, and then:

    var toMarkdown = require('to-markdown'),
        converter = new toMarkdown.converter();
    converter.makeMd('<h1>Hello world</h1>', function(result) {
      // result == '# Hello world'
      // do something with result
    });

### Unit tests

Node.js unit tests can be run with NodeUnit:

    $ npm test

This will test both server-side and client-side tests (using [zombie-qunit](https://github.com/bergie/zombie-qunit)).

## Licence

to-markdown is copyright &copy; 2011-2012 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.
