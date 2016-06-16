'use strict'

module.exports = [
  {
    filter: 'h1',
    replacement: function (content, node) {
      var underline = Array(content.length + 1).join('=')
      return '\n\n' + content + '\n' + underline + '\n\n'
    }
  },

  {
    filter: 'h2',
    replacement: function (content, node) {
      var underline = Array(content.length + 1).join('-')
      return '\n\n' + content + '\n' + underline + '\n\n'
    }
  },

  {
    filter: 'sup',
    replacement: function (content) {
      return '^' + content + '^'
    }
  },

  {
    filter: 'sub',
    replacement: function (content) {
      return '~' + content + '~'
    }
  },

  {
    filter: 'br',
    replacement: function () {
      return '\\\n'
    }
  },

  {
    filter: 'hr',
    replacement: function () {
      return '\n\n* * * * *\n\n'
    }
  },

  {
    filter: ['em', 'i'],
    replacement: function (content) {
      return '*' + content + '*'
    }
  },

  {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings
      var isCodeElem = node.nodeName === 'CODE' ||
          node.nodeName === 'KBD' ||
          node.nodeName === 'SAMP' ||
          node.nodeName === 'TT'

      return isCodeElem && !isCodeBlock
    },
    replacement: function (content) {
      return '`' + content + '`'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'A' && node.getAttribute('href')
    },
    replacement: function (content, node) {
      var url = node.getAttribute('href')
      var titlePart = node.title ? ' "' + node.title + '"' : ''
      if (content === url) {
        return '<' + url + '>'
      } else if (url.match('mailto:' + content)) {
        return '<' + content + '>'
      } else {
        return '[' + content + '](' + url + titlePart + ')'
      }
    }
  },

  {
    filter: 'li',
    replacement: function (content, node) {
      content = content.replace(/^\s+/, '').replace(/\n/gm, '\n    ')
      var prefix = '-   '
      var parent = node.parentNode

      if (/ol/i.test(parent.nodeName)) {
        var index = Array.prototype.indexOf.call(parent.children, node) + 1
        prefix = index + '. '
        while (prefix.length < 4) {
          prefix += ' '
        }
      }

      return prefix + content
    }
  }
]
