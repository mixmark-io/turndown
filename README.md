# to-markdown

An HTML to Markdown converter written in JavaScript.

The API is as follows:

```js
toMarkdown(stringOfHTML, options);
```

## Installation

### Browser

Download the compiled script located at `dist/to-markdown.js`.

```html
<script src="PATH/TO/to-markdown.js"></script>
<script>toMarkdown('<h1>Hello world!</h1>')</script>
```

Or with **Bower**:

```sh
$ bower install to-markdown
```

```html
<script src="PATH/TO/bower_components/to-markdown/dist/to-markdown.js"></script>
<script>toMarkdown('<h1>Hello world!</h1>')</script>
```

### Node.js

Install the `to-markdown` module:

```sh
$ npm install to-markdown
```

Then you can use it like below:

```js
var toMarkdown = require('to-markdown');
toMarkdown('<h1>Hello world!</h1>');
```

(Note it is no longer necessary to call `.toMarkdown` on the required module as of v1.)

## Options

### `converters` (array)

to-markdown can be extended by passing in an array of converters to the options object:

```js
toMarkdown(stringOfHTML, { converters: [converter1, converter2, …] });
```

A converter object consists of a **filter**, and a **replacement**. This example from the source replaces `code` elements:

```js
{
  filter: 'code',
  replacement: function(content) {
    return '`' + content + '`';
  }
}
```

#### `filter` (string|array|function)

The filter property determines whether or not an element should be replaced. DOM nodes can be selected simply by filtering by tag name, with strings or with arrays of strings:

 * `filter: 'p'` will select `p` elements
 * `filter: ['em', 'i']` will select `em` or `i` elements

Alternatively, the filter can be a function that returns a boolean depending on whether a given node should be replaced. The function is passed a DOM node as its only argument. For example, the following will match any `span` element with an `italic` font style:

```js
filter: function (node) {
  return node.nodeName === 'SPAN' && /italic/i.test(node.style.fontStyle);
}
```

#### `replacement` (function)

The replacement function determines how an element should be converted. It should return the markdown string for a given node. The function is passed the node’s content, as well as the node itself (used in more complex conversions). It is called in the context of `toMarkdown`, and therefore has access to the methods detailed below.

The following converter replaces heading elements (`h1`-`h6`):

```js
{
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

  replacement: function(innerHTML, node) {
    var hLevel = node.tagName.charAt(1);
    var hPrefix = '';
    for(var i = 0; i < hLevel; i++) {
      hPrefix += '#';
    }
    return '\n' + hPrefix + ' ' + innerHTML + '\n\n';
  }
}
```

### `gfm` (boolean)

to-markdown has beta support for GitHub flavored markdown (GFM). Set the `gfm` option to true:

```js
toMarkdown('<del>Hello world!</del>', { gfm: true });
```

## Methods

The following methods can be called on the `toMarkdown` object.

### `isBlock(node)`

Returns `true`/`false` depending on whether the element is block level.

### `isVoid(node)`

Returns `true`/`false` depending on whether the element is [void](http://www.w3.org/TR/html-markup/syntax.html#syntax-elements).

### `trim(string)`

Returns the string with leading and trailing whitespace removed.

### `outer(node)`

Returns the content of the node along with the element itself.

## Development

First make sure you have node.js/npm installed, then:

```sh
$ npm install --dev
$ bower install --dev
```

Automatically browserify the module when source files change by running:

```sh
$ npm start
```

### Tests

To run the tests in the browser, open `test/index.html`.

To run in node.js:

```sh
$ npm test
```

## Credits

Thanks to all [contributors](https://github.com/domchristie/to-markdown/graphs/contributors). Also, thanks to [Alex Cornejo](https://github.com/acornejo) for advice and inspiration for the breadth-first search algorithm.

## Licence

to-markdown is copyright &copy; 2011-15 [Dom Christie](http://domchristie.co.uk) and released under the MIT license.
