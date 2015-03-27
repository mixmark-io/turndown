# to-markdown

An HTML to Markdown converter written in JavaScript.

The API is as follows:

    toMarkdown(stringOfHTML);

## Installation

### Browser

Download the compiled script located at `dist/to-markdown.js`.

    <script src="PATH/TO/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world!</h1>')</script>

Or with **Bower**:

    $ bower install to-markdown

    <script src="PATH/TO/bower_components/to-markdown/dist/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world!</h1>')</script>

### Node.js

    $ npm install to-markdown

    var toMarkdown = require('to-markdown');
    toMarkdown('<h1>Hello world!</h1>');

(Note it is no longer necessary to call `.toMarkdown` on the required module as of v1.)

## Tests

to-markdown uses QUnit for testing. To run the tests in the browser, first make sure you have node.js/npm installed, then:

    $ npm install --dev
    $ bower install --dev

Then open `test/test-runner.html`.

To run in node.js:

    $ npm install --dev
    $ npm test

## Licence

to-markdown is copyright &copy; 2011-15 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.