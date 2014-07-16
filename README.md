# to-markdown

An HTML to Markdown converter written in javascript.

A basic implementation is there, but it's not yet fully bulletproof (contributions welcome!).

## Usage

### Browser

**to-markdown** depends on [he.js](https://github.com/mathiasbynens/he). Include both he.js and to-markdown:

    <script src="PATH/TO/he.js"></script>
    <script src="PATH/TO/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world</h1>')</script>

### Bower

    bower install to-markdown

### Node.js

    npm install to-markdown

    var toMarkdown = require('to-markdown').toMarkdown;
    toMarkdown('<h1>Hello world</h1>');

### Unit tests

Node.js unit tests can be run with NodeUnit:

    $ npm test

This will test both server-side and client-side tests (using [zombie-qunit](https://github.com/bergie/zombie-qunit)).

## Known issues

There are a couple of known issues surrounding blockquotes in lists (and perhaps vice versa) &mdash; #2; and also how to handle HTML elements outside of the markdown subset (keep them/strip them?) &mdash; #3.

## Licence

to-markdown is copyright &copy; 2011-14 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.
