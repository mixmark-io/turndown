# to-markdown

An HTML to Markdown converter written in javascript.

A basic implementation is there, but it's not yet fully bulletproof (contributions welcome!).

## Known issues

There are a couple of known issues surrounding blockquotes in lists (and perhaps vice versa) &mdash; #2; and also how to handle HTML elements outside of the markdown subset (keep them/strip them?) &mdash; #3.

## Running under Node.js

to-markdown can also be run under Node.js. Install it via NPM, and then:

    var toMarkdown = require('to-markdown').toMarkdown;
    console.log(toMarkdown('<b>Hello world</b>'));
    // Will output '**Hello world**'

### Unit tests

Node.js unit tests can be run with NodeUnit:

    $ npm test

This will test both server-side and client-side tests (using [zombie-qunit](https://github.com/bergie/zombie-qunit)).

## Licence

to-markdown is copyright &copy; 2011 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.
