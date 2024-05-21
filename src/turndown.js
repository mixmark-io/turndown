import COMMONMARK_RULES from './commonmark-rules'
import Rules from './rules'
import { extend, trimLeadingNewlines, trimTrailingNewlines } from './utilities'
import RootNode from './root-node'
import Node from './node'
var reduce = Array.prototype.reduce
// Taken from `commonmark.js/lib/common.js`.
var TAGNAME = '[A-Za-z][A-Za-z0-9-]*'
var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*'
var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+"
var SINGLEQUOTEDVALUE = "'[^']*'"
var DOUBLEQUOTEDVALUE = '"[^"]*"'
var ATTRIBUTEVALUE =
    '(?:' +
    UNQUOTEDVALUE +
    '|' +
    SINGLEQUOTEDVALUE +
    '|' +
    DOUBLEQUOTEDVALUE +
    ')'
var ATTRIBUTEVALUESPEC = '(?:' + '\\s*=' + '\\s*' + ATTRIBUTEVALUE + ')'
var ATTRIBUTE = '(?:' + '\\s+' + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + '?)'
var OPENTAG = '<' + TAGNAME + ATTRIBUTE + '*' + '\\s*/?>'
var CLOSETAG = '</' + TAGNAME + '\\s*[>]'
var HTMLCOMMENT = '<!-->|<!--->|<!--(?:[^-]+|-[^-]|--[^>])*-->'
var PROCESSINGINSTRUCTION = '[<][?][\\s\\S]*?[?][>]'
var DECLARATION = '<![A-Z]+' + '[^>]*>'
var CDATA = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
var HTMLTAG =
    '(?:' +
    OPENTAG +
    '|' +
    CLOSETAG +
    '|' +
    // Note: Turndown removes comments, so this portion of the regex isn't
    // necessary, but doesn't cause problems.
    HTMLCOMMENT +
    '|' +
    PROCESSINGINSTRUCTION +
    '|' +
    DECLARATION +
    '|' +
    CDATA +
    ')'
// End of copied commonmark code.
var escapes = [
  [/\\/g, '\\\\'],
  [/\*/g, '\\*'],
  [/^-/g, '\\-'],
  [/^\+ /g, '\\+ '],
  [/^(=+)/g, '\\$1'],
  [/^(#{1,6}) /g, '\\$1 '],
  [/`/g, '\\`'],
  [/^~~~/g, '\\~~~'],
  [/\[/g, '\\['],
  [/\]/g, '\\]'],
  [/^>/g, '\\>'],
  [/_/g, '\\_'],
  [/^(\d+)\. /g, '$1\\. '],
  // Per [section 6.6 of the CommonMark spec](https://spec.commonmark.org/0.30/#raw-html),
  // Raw HTML, CommonMark recognizes and passes through HTML-like tags and
  // their contents. Therefore, Turndown needs to escape text that would parse
  // as an HTML-like tag. This regex recognizes these tags and escapes them by
  // inserting a leading backslash.
  [new RegExp(HTMLTAG, 'g'), '\\$&'],
  // Likewise, [section 4.6 of the CommonMark spec](https://spec.commonmark.org/0.30/#html-blocks),
  // HTML blocks, requires the same treatment.
  //
  // This regex was copied from `commonmark.js/lib/blocks.js`, the
  // `reHtmlBlockOpen` variable. We only need regexps for patterns not matched
  // by the previous pattern, so this doesn't need all expressions there.
  //
  // TODO: this is too aggressive; it should only recognize this pattern at
  // the beginning of a line of CommonnMark source; these will recognize the
  // pattern at the beginning of any inline or block markup. The approach I
  // tried was to put this in `commonmark-rules.js` for the `paragraph` and
  // `heading` rules (the only block beginning-of-line rules). However, text
  // outside a paragraph/heading doesn't get escaped in this case.
  [/^<(?:script|pre|textarea|style)(?:\s|>|$)/i, '\\$&'],
  [/^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i, '\\$&']
]

export default function TurndownService (options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options)

  var defaults = {
    rules: COMMONMARK_RULES,
    headingStyle: 'setext',
    hr: '* * *',
    bulletListMarker: '*',
    codeBlockStyle: 'indented',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    br: '  ',
    preformattedCode: false,
    // Should the output be pure (pure Markdown, with no HTML blocks; this discards any HTML input that can't be represented in "pure" Markdown) or faithful (any input HTML that can't be exactly duplicated using Markdwon remains HTML is the resulting output)? This is `false` by default, following the original author's design.
    renderAsPure: true,
    blankReplacement: function (content, node) {
      return node.isBlock ? '\n\n' : ''
    },
    keepReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    },
    defaultReplacement: function (content, node, options) {
      // A hack: for faithful output, always produce the HTML, rather than the content. To get this, tell the node it's impure.
      node.renderAsPure = options.renderAsPure
      return node.isBlock ? '\n\n' + node.ifPure(content) + '\n\n' : node.ifPure(content)
    }
  }
  this.options = extend({}, defaults, options)
  this.rules = new Rules(this.options)
}

TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */

  turndown: function (input) {
    if (!canConvert(input)) {
      throw new TypeError(
        input + ' is not a string, or an element/document/fragment node.'
      )
    }

    if (input === '') return ''

    var output = process.call(this, new RootNode(input, this.options))
    return postProcess.call(this, output)
  },

  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */

  use: function (plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i])
    } else if (typeof plugin === 'function') {
      plugin(this)
    } else {
      throw new TypeError('plugin must be a Function or an Array of Functions')
    }
    return this
  },

  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  addRule: function (key, rule) {
    this.rules.add(key, rule)
    return this
  },

  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  keep: function (filter) {
    this.rules.keep(filter)
    return this
  },

  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  remove: function (filter) {
    this.rules.remove(filter)
    return this
  },

  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */

  escape: function (string) {
    return escapes.reduce(function (accumulator, escape) {
      return accumulator.replace(escape[0], escape[1])
    }, string)
  }
}

/**
 * Reduces a DOM node down to its Markdown string equivalent
 * @private
 * @param {HTMLElement} parentNode The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function process (parentNode) {
  var self = this
  // Note that the root node passed to Turndown isn't translated -- only its children, since the root node is simply a container (a div or body tag) of items to translate. Only the root node's `renderAsPure` attribute is undefined; treat it as pure, since we never translate this node.
  if (parentNode.renderAsPure || parentNode.renderAsPure === undefined) {
    return reduce.call(parentNode.childNodes, function (output, node) {
      node = new Node(node, self.options)

      var replacement = ''
      // Is this a text node?
      if (node.nodeType === 3) {
        replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue)
      // Is this an element node?
      } else if (node.nodeType === 1) {
        replacement = replacementForNode.call(self, node)
      // In faithful mode, return the contents for these special cases.
      } else if (!self.options.renderAsPure) {
        if (node.nodeType === 4) {
          replacement = `<!CDATA[[${node.nodeValue}]]>`
        } else if (node.nodeType === 7) {
          replacement = `<?${node.nodeValue}?>`
        } else if (node.nodeType === 8) {
          replacement = `<!--${node.nodeValue}-->`
        } else if (node.nodeType === 10) {
          replacement = `<!${node.nodeValue}>`
        }
      }

      return join(output, replacement)
    }, '')
  } else {
    // If the `parentNode` represented itself as raw HTML, that contains all the contents of the child nodes.
    return ''
  }
}

/**
 * Appends strings as each rule requires and trims the output
 * @private
 * @param {String} output The conversion output
 * @returns A trimmed version of the output
 * @type String
 */

function postProcess (output) {
  var self = this
  this.rules.forEach(function (rule) {
    if (typeof rule.append === 'function') {
      output = join(output, rule.append(self.options))
    }
  })

  return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
}

/**
 * Converts an element node to its Markdown equivalent
 * @private
 * @param {HTMLElement} node The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function replacementForNode (node) {
  var rule = this.rules.forNode(node)
  node.addPureAttributes((typeof rule.pureAttributes === 'function' ? rule.pureAttributes(node, this.options) : rule.pureAttributes) || {})
  var content = process.call(this, node)
  var whitespace = node.flankingWhitespace
  if (whitespace.leading || whitespace.trailing) content = content.trim()
  return (
    whitespace.leading +
    // If this node contains impure content, then it must be replaced with HTML. In this case, the `content` doesn't matter, so it's passed as an empty string.
    (node.renderAsPure ? rule.replacement(content, node, this.options) : this.options.defaultReplacement('', node, this.options)) +
    whitespace.trailing
  )
}

/**
 * Joins replacement to the current output with appropriate number of new lines
 * @private
 * @param {String} output The current conversion output
 * @param {String} replacement The string to append to the output
 * @returns Joined output
 * @type String
 */

function join (output, replacement) {
  var s1 = trimTrailingNewlines(output)
  var s2 = trimLeadingNewlines(replacement)
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length)
  var separator = '\n\n'.substring(0, nls)

  return s1 + separator + s2
}

/**
 * Determines whether an input can be converted
 * @private
 * @param {String|HTMLElement} input Describe this parameter
 * @returns Describe what it returns
 * @type String|Object|Array|Boolean|Number
 */

function canConvert (input) {
  return (
    input != null && (
      typeof input === 'string' ||
      (input.nodeType && (
        input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
      ))
    )
  )
}
