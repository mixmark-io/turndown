import COMMONMARK_RULES from './commonmark-rules'
import Rules from './rules'
import { extend } from './utilities'
import RootNode from './root-node'
import Node from './node'
var reduce = Array.prototype.reduce
var leadingNewLinesRegExp = /^\n*/
var trailingNewLinesRegExp = /\n*$/
var escapes = [
  [/wwwlink/, 'ESCAPED']
  [/\\/, '\\\\'],
  [/\*/, '\\*'],
  [/^-/, '\\-'],
  [/^\+ /, '\\+ '],
  [/^(=+)/, '\\$1'],
  [/^(#{1,6}) /, '\\$1 '],
  [/`/, '\\`'],
  [/^~~~/, '\\~~~'],
  [/\[/, '\\['],
  [/\]/, '\\]'],
  [/^>/, '\\>'],
  [/_/, '\\_'],
  [/^(\d+)\. /, '$1\\. ']
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

    var output = process.call(this, new RootNode(input))
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

    // Since the escape regexps themselves can contain capture groups, keeping track of which capture group
    // belongs to which escape rule is necessary.
    let reorderedEscapes = {}
    let reorderedIndex = 0
    // Merge the escape regexps into a single one in following form:
    // /(escape1)|(escape2)| ... (escape~)/g 
    const escapesRegexp = escapes.reduce((accumulator, group, index, arr) => {
      let regex = group[0].toString().slice(1, -1)
      let innerGroups = []

      // https://stackoverflow.com/a/19863847
      // TODO: find a (reasonably) recursive version that handles nested brackets
      const groups = regex.match(/(\([^\(\)]*\))/g)
      if (groups) {
        groups.forEach(() => { 
          innerGroups.push(reorderedIndex++)
        })
      }
      reorderedEscapes[reorderedIndex++] = {escapeIndex: index, groupsIndex: innerGroups}

      accumulator += `(${group[0].toString().slice(1, -1)})` // remove the forward slashes
      if ((arr.length - 1) !== index) {
        accumulator += '|'
      }
      return accumulator
    }, "")


    function replacer(...args) {
      const matchingGroups = args.slice(1, -2) // args = (match, p1, p2, (...), pn, offset, string)
      let escaped = ""
      matchingGroups.forEach((group, index) => {
        if (group) { // 
          const escapeIndex = reorderedEscapes[index].escapeIndex
          const groupsIndex = reorderedEscapes[index].groupsIndex
          escaped = escapes[escapeIndex][1]
          groupsIndex.forEach((escapeGroupIndex, index) => {
            escaped = escaped.replace(new RegExp(`\\$${index + 1}`), groups[escapeGroupIndex])
          }); 
        }
      })
      return escaped;
    }

    return string.replace(new RegExp(escapesRegexp, "g"), replacer)
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
  return reduce.call(parentNode.childNodes, function (output, node) {
    node = new Node(node)

    var replacement = ''
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue)
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node)
    }

    return join(output, replacement)
  }, '')
}

/**
 * Appends strings as each rule requires and trims the output
 * @private
 * @param {String} output The conversion output
 * @returns A trimmed version of the ouput
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
  var content = process.call(this, node)
  var whitespace = node.flankingWhitespace
  if (whitespace.leading || whitespace.trailing) content = content.trim()
  return (
    whitespace.leading +
    rule.replacement(content, node, this.options) +
    whitespace.trailing
  )
}

/**
 * Determines the new lines between the current output and the replacement
 * @private
 * @param {String} output The current conversion output
 * @param {String} replacement The string to append to the output
 * @returns The whitespace to separate the current output and the replacement
 * @type String
 */

function separatingNewlines (output, replacement) {
  var newlines = [
    output.match(trailingNewLinesRegExp)[0],
    replacement.match(leadingNewLinesRegExp)[0]
  ].sort()
  var maxNewlines = newlines[newlines.length - 1]
  return maxNewlines.length < 2 ? maxNewlines : '\n\n'
}

function join (string1, string2) {
  var separator = separatingNewlines(string1, string2)

  // Remove trailing/leading newlines and replace with separator
  string1 = string1.replace(trailingNewLinesRegExp, '')
  string2 = string2.replace(leadingNewLinesRegExp, '')

  return string1 + separator + string2
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
