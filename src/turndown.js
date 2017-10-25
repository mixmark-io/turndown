import COMMONMARK_RULES from './commonmark-rules'
import OptionsValidator from './options-validator'
import { extend } from './utilities'
import RootNode from './root-node'
import Node from './node'
var reduce = Array.prototype.reduce
var leadingNewLinesRegExp = /^\n*/
var trailingNewLinesRegExp = /\n*$/
var optionsValidator = new OptionsValidator()

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
    defaultReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
    },
    keep: function (node) {
      switch (node.nodeName) {
        case 'TABLE':
          return true
        case 'PRE':
          return node.firstChild && node.firstChild.nodeName !== 'CODE'
        default:
          return false
      }
    },
    remove: ['head', 'link', 'meta', 'script', 'style']
  }
  optionsValidator.validate(options)
  this.options = extend({}, defaults, options)

  this.options.keepConverter = this.options.keepConverter || {
    filter: this.options.keep,
    replacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
    }
  }

  this.options.removeConverter = this.options.removeConverter || {
    filter: this.options.remove,
    replacement: function () {
      return ''
    }
  }
}

TurndownService.prototype = {
  turndown: function (input) {
    if (!canConvert(input)) {
      throw new TypeError(
        input + ' is not a string, or an element/document/fragment node.'
      )
    }

    if (input === '') return ''

    var root = new RootNode(input)
    return this.postProcess(this.process(root))
  },

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

  addRule: function (key, rule) {
    this.options.rules[key] = rule
    return this
  },

  /**
   * Reduces a DOM node down to its Markdown string equivalent
   */

  process: function process (parentNode) {
    var _this = this
    return reduce.call(parentNode.childNodes, function (output, node) {
      node = new Node(node)

      var replacement = ''
      if (node.nodeType === 3) {
        replacement = _this.escape(node.nodeValue)
      } else if (node.nodeType === 1) {
        replacement = _this.replacementForNode(node)
      }

      return join(output, replacement)
    }, '')
  },

  /**
   * Escapes Markdown syntax
   */

  escape: function escape (string) {
    return (
      string
        // Escape hr
        .replace(/^([-*_] *){3,}$/gm, function (match, character) {
          return match.split(character).join('\\' + character)
        })

        // Escape ol bullet points
        .replace(/^(\W* {0,3})(\d+)\. /gm, '$1$2\\. ')

        // Escape ul bullet points
        .replace(/^([^\\\w]*)[*+-] /gm, function (match) {
          return match.replace(/([*+-])/g, '\\$1')
        })

        // Escape blockquote indents
        .replace(/^(\W* {0,3})> /gm, '$1\\> ')

        // Escape em/strong *
        .replace(/\*+(?![*\s\W]).+?\*+/g, function (match) {
          return match.replace(/\*/g, '\\*')
        })

        // Escape em/strong _
        .replace(/_+(?![_\s\W]).+?_+/g, function (match) {
          return match.replace(/_/g, '\\_')
        })

        // Escape `
        .replace(/[^\\]`[^`\s.].+?`/g, function (match) {
          return match.replace(/`/g, '\\`')
        })

        // Escape link brackets
        .replace(/\[([^\]]*)\]/g, '\\[$1\\]') // eslint-disable-line no-useless-escape
    )
  },

  /**
   * Converts an element node to its Markdown equivalent
   */

  replacementForNode: function replacementForNode (node) {
    var rule = this.ruleForNode(node)
    var content = this.process(node)
    var whitespace = node.flankingWhitespace
    if (whitespace.leading || whitespace.trailing) content = content.trim()
    return (
      whitespace.leading +
      rule.replacement(content, node, this.options) +
      whitespace.trailing
    )
  },

  /**
   * Finds a rule for a given node
   */

  ruleForNode: function ruleForNode (node) {
    if (this.filterValue(this.options.keepConverter, node)) {
      return this.options.keepConverter
    }

    if (this.filterValue(this.options.removeConverter, node)) {
      return this.options.removeConverter
    }

    if (node.isBlank) return { replacement: this.options.blankReplacement }

    for (var key in this.options.rules) {
      var rule = this.options.rules[key]
      if (this.filterValue(rule, node)) return rule
    }

    return { replacement: this.options.defaultReplacement }
  },

  filterValue: function filterValue (rule, node) {
    var filter = rule.filter
    if (typeof filter === 'string') {
      if (filter === node.nodeName.toLowerCase()) return true
    } else if (Array.isArray(filter)) {
      if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
    } else if (typeof filter === 'function') {
      if (filter.call(rule, node, this.options)) return true
    } else {
      throw new TypeError('`filter` needs to be a string, array, or function')
    }
  },

  postProcess: function postProcess (output) {
    for (var key in this.options.rules) {
      var rule = this.options.rules[key]
      if (typeof rule.append === 'function') {
        output = join(output, rule.append(this.options))
      }
    }
    return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
  }
}

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
 */

function canConvert (input) {
  return (
    input != null && (
      typeof input === 'string' ||
      input.nodeType && (
        input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
      )
    )
  )
}
