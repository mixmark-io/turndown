# to-markdown

An HTML to Markdown converter written in JavaScript.

The basic API is as follows:

    toMarkdown(stringOfHTML, options);

## Installation

### Browser

to-markdown depends on [he.js](https://github.com/mathiasbynens/he):

    <script src="PATH/TO/he.js"></script>
    <script src="PATH/TO/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world!</h1>')</script>

#### Bower

    $ bower install to-markdown

…

    <script src="PATH/TO/bower_components/he/he.js"></script>
    <script src="PATH/TO/bower_components/to-markdown/to-markdown.js"></script>

    <script>toMarkdown('<h1>Hello world!</h1>')</script>

### Node.js

    $ npm install to-markdown

…

    var toMarkdown = require('to-markdown').toMarkdown;
    toMarkdown('<h1>Hello world!</h1>');


## Options

### `converters`

to-markdown can be extended by passing in an array of converters to the options object. A converter object consists of a **filter** and a **replacement** function. For example, the following will treat `span`s with an italic font-style like an `em` element:

    toMarkdown('<span style="font-style: italic">Hello world!</span>', {
      converters: [
        {
          filter: function (node) {
            return /span/i.test(node.tagName) &&
              /italic/i.test(node.style.fontStyle);
          },

          replacement: function (innerHTML, node) {
            return '_' + innerHTML + '_';
          }
        }
      ]
    });

#### `filter`

The filter property can be a String, RegExp, or Function.

A regular expression or string (representing a pattern), that will match the **tagName** of a DOM node. Some examples from the source:

* `filter: 'p'` will match any `p` elements
* `filter: 'h[1-6]'` will match any heading elements
* `filter: /^em$|^i$/i` will match any `em` or `i` elements

Note that a RegExp should be case-insensitive and will usually have beginning and end characters (`^` and `$`)

Alternatively, the filter can be a function that returns a boolean depending on whether a given node can be converted. The function is passed a DOM node as its only argument. For example, the following will match any `span` element with an `italic` style:

    …
    filter: function (node) {
      return /span/i.test(node.tagName) && /italic/i.test(node.style);
    }
    …

#### `replacement`

The replacement function should return a markdown string for a given node. The function is passed the node’s innerHTML[1], as well as the node itself (used in more advanced conversions).

The following converter replaces heading elements (`h1`-`h6`):

    {
      filter: 'h[1-6]',

      replacement: function(innerHTML, node) {
        var hLevel = node.tagName.charAt(1);
        var hPrefix = '';
        for(var i = 0; i < hLevel; i++) {
          hPrefix += '#';
        }
        return '\n' + hPrefix + ' ' + innerHTML + '\n\n';
      }
    }

[1] The innerHTML parameter has had leading/trailing whitespace removed, and has HTML entities decoded.

## Tests

to-markdown uses QUnit for testing. To run the tests in the browser, first make sure you have node.js/npm installed, then:

    $ npm install --dev
    $ bower install --dev

Then open `test/test-runner.html`.

To run in node.js:

    $ npm install --dev
    $ npm test

## Licence

to-markdown is copyright &copy; 2011-14 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.