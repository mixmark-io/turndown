import COMMONMARK_RULES from './commonmark-rules'
import Rules from './rules'
import { escapeMarkdown, extend, trimLeadingNewlines, trimTrailingNewlines } from './utilities'
import RootNode from './root-node'
import Node from './node'

export default function TurndownService (options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options)

  const defaults = {
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
    blankReplacement: function (content, node) {
      return node.isBlock ? '\n\n' : ''
    },
    keepReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    },
    defaultReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
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

    const output = process.call(this, new RootNode(input, this.options))
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
      for (let i = 0; i < plugin.length; i++) this.use(plugin[i])
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
    return escapeMarkdown(string)
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
  const self = this
  const children = parentNode.childNodes
  const parts = []

  for (let i = 0, len = children.length; i < len; i++) {
    const node = new Node(children[i], self.options)

    let replacement = ''
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue)
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node)
    }

    if (parts.length === 0) {
      // First part: same logic as join('', replacement)
      // trimTrailingNewlines('') = '', so s1 = ''
      // nls = max(0, leadingNls) = leadingNls
      let replStart = 0
      while (replStart < replacement.length && replacement[replStart] === '\n') replStart++
      const leadingNls = replStart
      let nls = leadingNls
      if (nls > 2) nls = 2
      if (nls > 0) parts.push('\n\n'.substring(0, nls))
      const trimmed = replStart < replacement.length ? replacement.substring(replStart) : ''
      if (trimmed) parts.push(trimmed)
    } else {
      const last = parts[parts.length - 1]

      // Trim trailing newlines from the last part
      let lastEnd = last.length
      while (lastEnd > 0 && last[lastEnd - 1] === '\n') lastEnd--
      const trailingNls = last.length - lastEnd

      // Count leading newlines in the replacement
      let replStart = 0
      while (replStart < replacement.length && replacement[replStart] === '\n') replStart++
      const leadingNls = replStart

      // Separator: max of trailing and leading newlines, capped at 2
      let nls = Math.max(trailingNls, leadingNls)
      if (nls > 2) nls = 2

      // Update last part (remove trailing newlines)
      parts[parts.length - 1] = lastEnd > 0 ? last.substring(0, lastEnd) : ''

      // Add separator
      if (nls > 0) parts.push('\n\n'.substring(0, nls))

      // Add trimmed replacement
      const trimmed = replStart < replacement.length ? replacement.substring(replStart) : ''
      if (trimmed) parts.push(trimmed)
    }
  }

  return parts.join('')
}

/**
 * Appends strings as each rule requires and trims the output
 * @private
 * @param {String} output The conversion output
 * @returns A trimmed version of the ouput
 * @type String
 */

function postProcess (output) {
  const self = this
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
  const rule = this.rules.forNode(node)
  let content = process.call(this, node)
  const whitespace = node.flankingWhitespace
  if (whitespace.leading || whitespace.trailing) content = content.trim()
  return (
    whitespace.leading +
    rule.replacement(content, node, this.options) +
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
  const s1 = trimTrailingNewlines(output)
  const s2 = trimLeadingNewlines(replacement)
  const nls = Math.max(output.length - s1.length, replacement.length - s2.length)
  const separator = '\n\n'.substring(0, nls)

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
