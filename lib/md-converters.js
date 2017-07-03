'use strict'

module.exports = [
  {
    filter: 'p',
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'br',
    replacement: function () {
      return '  \n'
    }
  },

  {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content, node) {
      var hLevel = node.nodeName.charAt(1)
      var hPrefix = ''
      for (var i = 0; i < hLevel; i++) {
        hPrefix += '#'
      }
      return '\n\n' + hPrefix + ' ' + content + '\n\n'
    }
  },

  {
    filter: 'hr',
    replacement: function () {
      return '\n\n* * *\n\n'
    }
  },

  {
    filter: ['em', 'i'],
    replacement: function (content) {
      return '_' + content + '_'
    }
  },

  {
    filter: ['strong', 'b'],
    replacement: function (content) {
      return '**' + content + '**'
    }
  },

  // Inline code
  {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings

      return node.nodeName === 'CODE' && !isCodeBlock
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
      var titlePart = node.title ? ' "' + node.title + '"' : ''
      return '[' + content + '](' + node.getAttribute('href') + titlePart + ')'
    }
  },

  {
    filter: 'img',
    replacement: function (content, node) {
      var alt = node.alt || ''
      var src = node.getAttribute('src') || ''
      var title = node.title || ''
      var titlePart = title ? ' "' + title + '"' : ''
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
    }
  },

  // Code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n    ' + node.firstChild.textContent.replace(/\n/g, '\n    ') + '\n\n'
    }
  },

  {
    filter: 'blockquote',
    replacement: function (content) {
      content = content.trim()
      content = content.replace(/\n{3,}/g, '\n\n')
      content = content.replace(/^/gm, '> ')
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'li',
    replacement: function (content, node) {
      content = content.replace(/^\s+/, '').replace(/\n/gm, '\n    ')
      var prefix = '*   '
      var parent = node.parentNode
      if (parent.nodeName === 'OL') {
        var start = parent.getAttribute('start')
        var index = Array.prototype.indexOf.call(parent.children, node)
        prefix = (start ? Number(start) + index : index + 1) + '.  '
      }

      return prefix + content
    }
  },

  {
    filter: ['ul', 'ol'],
    replacement: function (content, node) {
      var strings = []
      for (var i = 0; i < node.childNodes.length; i++) {
        strings.push(node.childNodes[i]._replacement)
      }

      if (/li/i.test(node.parentNode.nodeName)) {
        return '\n' + strings.join('\n')
      }
      return '\n\n' + strings.join('\n') + '\n\n'
    }
  },

  {
    filter: function (node) {
      return this.isBlock(node)
    },
    replacement: function (content, node) {
      return '\n\n' + this.outer(node, content) + '\n\n'
    }
  },

  // Anything else!
  {
    filter: function () {
      return true
    },
    replacement: function (content, node) {
      return this.outer(node, content)
    }
  }
]
