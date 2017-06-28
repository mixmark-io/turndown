# Turndown

![](https://api.travis-ci.org/domchristie/turndown.svg)

Convert HTML into Markdown with JavaScript.

**Note this is currently a work-in-progress to replace https://github.com/domchristie/to-markdown. It is pre-release software. API changes are likely.**

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
| `fence`               | <code>```</code> or `~~~` | <code>```</code> |
| `emDelimiter`         | `_` or `*` | `_` |
| `strongDelimiter`     | `**` or `__` | `**` |
| `linkStyle`           | `inlined` or `referenced` | `inlined` |
| `linkReferenceStyle`  | `full`, `collapsed`, or `shortcut` | `full` |

## License

turndown is copyright © 2017+ Dom Christie and released under the MIT license.
