# to-markdown

An HTML to Markdown converter written in JavaScript.

The basic API is as follows:

    toMarkdown(stringOfHTML, options);

## Installation

### Browser

    <script src="PATH/TO/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world!</h1>')</script>

#### Bower

    $ bower install to-markdown

…

    <script src="PATH/TO/bower_components/to-markdown/to-markdown.js"></script>

    <script>toMarkdown.makeMD('<h1>Hello world!</h1>')</script>

### Node.js

    $ npm install to-markdown

…

    var toMarkdown = require('to-markdown');
    toMarkdown('<h1>Hello world!</h1>');

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