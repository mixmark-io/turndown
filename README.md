# to-markdown

An HTML to Markdown converter written in JavaScript.

The API is as follows:

    toMarkdown(stringOfHTML, options);

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

## Options

### `gfm` (boolean)

to-markdown has beta support for GitHub flavored markdown (GFM). Set the `gfm` option to true:

    toMarkdown('<del>Hello world!</del>', { gfm: true });

## Development & Contributing

First make sure you have node.js/npm installed, then:

    $ npm install --dev
    $ bower install --dev

Automatically browserify the module when source files change by running:

    $ npm start

### Tests

To run the tests in the browser, open `test/index.html`.

To run in node.js:

    $ npm test

## Credits

Thanks to all [contributors](https://github.com/domchristie/to-markdown/graphs/contributors). Also, thanks to [Alex Cornejo](https://github.com/acornejo) for advice and inspiration for the breadth-first search algorithm.

## Licence

to-markdown is copyright &copy; 2011-15 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.