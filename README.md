# Turndown

![](https://api.travis-ci.org/domchristie/turndown.svg)

Convert HTML into Markdown with JavaScript.

## Installation

npm:

```
npm install turndown
```

Browser:

```html
<script src="https://unpkg.com/turndown/dist/turndown.js"></script>
```

## Usage

```js
// For Node.js
var TurndownService = require('turndown')

var turndownService = new TurndownService()
var markdown = turndownService.turndown('<h1>Hello world!</h1>')
```

## Options

Options can be passed in to the constructor on instantiation.

| Option                | Valid values  | Default |
| :-------------------- | :------------ | :------ |
| `headingStyle`        | `setext` or `atx` | `setext`  |
| `hr`                  | Any [Thematic break](http://spec.commonmark.org/0.27/#thematic-breaks) | `* * *` |
| `bulletListMarker`    | `-`, `+`, or `*` | `*` |
| `codeBlockStyle`      | `indented` or `fenced` | `indented` |
| `fence`               | ` ``` ` or `~~~` | ` ``` ` |
| `emDelimiter`         | `_` or `*` | `_` |
| `strongDelimiter`     | `**` or `__` | `**` |
| `linkStyle`           | `inlined` or `referenced` | `inlined` |
| `linkReferenceStyle`  | `full`, `collapsed`, or `shortcut` | `full` |

### Advanced Options

| Option                | Valid values  | Default |
| :-------------------- | :------------ | :------ |
| `blankReplacement`    | rule replacement function | See **Special Rules** below |
| `keep`                | rule filter | See **Special Rules** below |
| `remove`              | rule filter | See **Special Rules** below |
| `defaultReplacement`  | rule replacement function | See **Special Rules** below |
| `keepRule`            | rule | See **Special Rules** below |
| `removeRule`          | rule | See **Special Rules** below |

## Methods

### `addRule(key, rule)`

The `key` parameter is a unique name for the rule for easy reference. Example:

```js
turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~' + content + '~'
  }
})
```

See **Extending with Rules** below.

### `use(plugin|array)`

Use a plugin, or an array of plugins. Example:

```js
// Import plugins from turndown-plugin-gfm
var turndownPluginGfm = require('turndown-plugin-gfm')
var gfm = turndownPluginGfm.gfm
var tables = gfm.tables
var strikethrough = gfm.strikethrough

// Use the gfm plugin
turndownService.use(gfm)

// Use the table and strikethrough plugins only
turndownService.use([tables, strikethrough])
```

See **Plugins** below.

## Extending with Rules

Turndown can be extended by adding **rules**. A rule is a plain JavaScript object with `filter` and `replacement` properties. For example, the rule for converting `<p>` elements is as follows:

```js
{
  filter: 'p',
  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  }
}
```

The filter selects `<p>` elements, and the replacement function returns the `<p>` contents separated by two new lines.

### `filter` String|Array|Function

The filter property determines whether or not an element should be replaced with the rule's `replacement`. DOM nodes can be selected simply using a tag name or an array of tag names:

 * `filter: 'p'` will select `<p>` elements
 * `filter: ['em', 'i']` will select `<em>` or `<i>` elements

Alternatively, the filter can be a function that returns a boolean depending on whether a given node should be replaced. The function is passed a DOM node as well as the `TurndownService` options. For example, the following rule selects `<a>` elements (with an `href`) when the `linkStyle` option is `inlined`:

```js
filter: function (node, options) {
  return (
    options.linkStyle === 'inlined' &&
    node.nodeName === 'A' &&
    node.getAttribute('href')
  )
}
```

### `replacement` Function

The replacement function determines how an element should be converted. It should return the Markdown string for a given node. The function is passed the node's content, the node itself, and the `TurndownService` options.

The following rule shows how `<em>` elements are converted:

```js
rules.emphasis = {
  filter: ['em', 'i'],

  replacement: function (content, node, options) {
    return options.emDelimiter + content + options.emDelimiter
  }
}
```

### Special Rules

**Blank rule** determines how to handle blank elements. It overrides every rule (even those added via `addRule`). A node is blank if it only contains whitespace, and it's not an `<a>`, `<td>`,`<th>` or a void element. Its behaviour can be customised using the `blankReplacement` option.

**Keep rule** determines how to handle the elements that should not be converted, i.e. rendered as HTML in the Markdown output. By default, it will keep `<table>` and plain `<pre>` elements. Block-level elements will be separated from surrounding content by blank lines. The keep rule `filter` can be customised using the `keep` option. To replace the rule, use the `keepRule` option. The keep rule may be overridden by rules added via `addRule`.

**Remove rule** determines which elements to remove altogether. By default, it removes `<head>`, `<link>`, `<meta>`, `<script>`, and `<style>` elements, and replaces them with an empty string. Like the keep rule, its `filter` can be customised using the `remove` option. To replace the rule, use the `removeRule` option. The remove rule may be overridden by rules added via `addRule`.

**Default rule** handles nodes which are not recognised by any other rule. By default, it outputs the node's text content (separated  by blank lines if it is a block-level element). Its behaviour can be customised with the `defaultReplacement` option.

### Rule Precedence

Turndown iterates over the set of rules, and picks the first one that matches satifies the `filter`. The following list describes the order of precedence:

1. Blank rule
2. Added rules (optional)
3. Keep rule
4. Remove rule
5. Commonmark rules
6. Default rule

## Plugins

The plugin API provides a convenient way for developers to apply multiple extensions. A plugin is just a function that is called with the `TurndownService` instance.

## License

turndown is copyright © 2017+ Dom Christie and released under the MIT license.
