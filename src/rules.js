/**
 * Manages a collection of rules used to convert HTML to Markdown
 */

export default function Rules (options) {
  this.options = options

  this.blankRule = {
    replacement: options.blankReplacement
  }

  this.defaultRule = {
    replacement: options.defaultReplacement
  }

  var keepRule = options.keepRule || {
    filter: options.keep,
    replacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
    }
  }

  var removeRule = options.removeRule || {
    filter: options.remove,
    replacement: function () {
      return ''
    }
  }

  this.array = [keepRule, removeRule]
  for (var key in options.rules) this.array.push(options.rules[key])
}

Rules.prototype = {
  add: function (key, rule) {
    this.array.unshift(rule)
  },

  forNode: function (node) {
    if (node.isBlank) return this.blankRule

    for (var i = 0; i < this.array.length; i++) {
      var rule = this.array[i]
      if (filterValue(rule, node, this.options)) return rule
    }

    return this.defaultRule
  },

  forEach: function (fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i)
  }
}

function filterValue (rule, node, options) {
  var filter = rule.filter
  if (typeof filter === 'string') {
    if (filter === node.nodeName.toLowerCase()) return true
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
  } else if (typeof filter === 'function') {
    if (filter.call(rule, node, options)) return true
  } else {
    throw new TypeError('`filter` needs to be a string, array, or function')
  }
}
