import Node from './node'
import { repeat } from './utilities'

var rules = {}

rules.paragraph = {
  filter: 'p',

  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  }
}

rules.lineBreak = {
  filter: 'br',

  replacement: function (content, node, options) {
    return options.br + '\n'
  }
}

rules.heading = {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

  replacement: function (content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1))

    if (options.headingStyle === 'setext' && hLevel < 3) {
      var underline = repeat((hLevel === 1 ? '=' : '-'), content.length)
      return (
        '\n\n' + content + '\n' + underline + '\n\n'
      )
    } else {
      return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
    }
  }
}

rules.blockquote = {
  filter: 'blockquote',

  replacement: function (content) {
    content = content.replace(/^\n+|\n+$/g, '')
    content = content.replace(/^/gm, '> ')
    return '\n\n' + content + '\n\n'
  }
}

rules.list = {
  filter: ['ul', 'ol'],
  pureAttributes: function (node, options) {
    // When rendering in faithful mode, check that all children are `<li>` elements that can be faithfully rendered. If not, this must be rendered as HTML.
    if (!options.renderAsPure) {
      var childrenPure = Array.prototype.reduce.call(node.childNodes,
        (previousValue, currentValue) =>
          previousValue &&
          currentValue.nodeName === 'LI' &&
          (new Node(currentValue, options)).renderAsPure, true
      )
      if (!childrenPure) {
        // If any of the children must be rendered as HTML, then this node must also be rendered as HTML.
        node.renderAsPure = false
        return
      }
    }
    // Allow a `start` attribute if this is an `ol`.
    return node.nodeName === 'OL' ? {start: undefined} : {}
  },

  replacement: function (content, node) {
    var parent = node.parentNode
    if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
      return '\n' + content
    } else {
      return '\n\n' + content + '\n\n'
    }
  }
}

rules.listItem = {
  filter: 'li',

  replacement: function (content, node, options) {
    content = content
      .replace(/^\n+/, '') // remove leading newlines
      .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
      .replace(/\n/gm, '\n    ') // indent
    var prefix = options.bulletListMarker + '   '
    var parent = node.parentNode
    if (parent.nodeName === 'OL') {
      var start = parent.getAttribute('start')
      var index = Array.prototype.indexOf.call(parent.children, node)
      prefix = (start ? Number(start) + index : index + 1) + '.  '
    }
    return (
      prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
    )
  }
}

rules.indentedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'indented' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  pureAttributes: function (node, options) {
    // Check the purity of the child block(s) which contain the code.
    node.renderAsPure = options.renderAsPure || (node.renderAsPure && (
      // There's only one child (the code element), and it's pure.
      new Node(node.firstChild, options)).renderAsPure && node.childNodes.length === 1 &&
      // There's only one child of this code element, and it's text.
      node.firstChild.childNodes.length === 1 && node.firstChild.firstChild.nodeType === 3)
  },

  replacement: function (content, node, options) {
    return (
      '\n\n    ' +
      node.firstChild.textContent.replace(/\n/g, '\n    ') +
      '\n\n'
    )
  }
}

rules.fencedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'fenced' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  pureAttributes: function (node, options) {
    // Check the purity of the child code element.
    var firstChild = new Node(node.firstChild, options)
    var className = firstChild.getAttribute('class') || ''
    var language = (className.match(/language-(\S+)/) || [null, ''])[1]
    // Allow the matched classname as pure Markdown. Compare using the `className` attribute, since the `class` attribute returns an object, not an easily-comparable string.
    if (language) {
      firstChild.renderAsPure = firstChild.renderAsPure || firstChild.className === `language-${language}`
    }
    node.renderAsPure = options.renderAsPure || (node.renderAsPure &&
      // There's only one child (the code element), and it's pure.
      firstChild.renderAsPure && node.childNodes.length === 1 &&
      // There's only one child of this code element, and it's text.
      node.firstChild.childNodes.length === 1 && node.firstChild.firstChild.nodeType === 3)
  },

  replacement: function (content, node, options) {
    var className = node.firstChild.getAttribute('class') || ''
    var language = (className.match(/language-(\S+)/) || [null, ''])[1]
    var code = node.firstChild.textContent

    var fenceChar = options.fence.charAt(0)
    var fenceSize = 3
    var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm')

    var match
    while ((match = fenceInCodeRegex.exec(code))) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1
      }
    }

    var fence = repeat(fenceChar, fenceSize)

    return (
      '\n\n' + fence + language + '\n' +
      code.replace(/\n$/, '') +
      '\n' + fence + '\n\n'
    )
  }
}

rules.horizontalRule = {
  filter: 'hr',

  replacement: function (content, node, options) {
    return '\n\n' + options.hr + '\n\n'
  }
}

rules.inlineLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'inlined' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  pureAttributes: {href: undefined, title: undefined},

  replacement: function (content, node) {
    var href = node.getAttribute('href')
    if (href) href = href.replace(/([()])/g, '\\$1')
    var title = cleanAttribute(node.getAttribute('title'))
    if (title) title = ' "' + title.replace(/"/g, '\\"') + '"'
    return '[' + content + '](' + href + title + ')'
  }
}

rules.referenceLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'referenced' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  pureAttributes: {href: undefined, title: undefined},

  replacement: function (content, node, options) {
    var href = node.getAttribute('href')
    var title = cleanAttribute(node.getAttribute('title'))
    if (title) title = ' "' + title + '"'
    var replacement
    var reference

    switch (options.linkReferenceStyle) {
      case 'collapsed':
        replacement = '[' + content + '][]'
        reference = '[' + content + ']: ' + href + title
        break
      case 'shortcut':
        replacement = '[' + content + ']'
        reference = '[' + content + ']: ' + href + title
        break
      default:
        var id = this.references.length + 1
        replacement = '[' + content + '][' + id + ']'
        reference = '[' + id + ']: ' + href + title
    }

    this.references.push(reference)
    return replacement
  },

  references: [],

  append: function (options) {
    var references = ''
    if (this.references.length) {
      references = '\n\n' + this.references.join('\n') + '\n\n'
      this.references = [] // Reset references
    }
    return references
  }
}

rules.emphasis = {
  filter: ['em', 'i'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.emDelimiter + content + options.emDelimiter
  }
}

rules.strong = {
  filter: ['strong', 'b'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.strongDelimiter + content + options.strongDelimiter
  }
}

rules.code = {
  filter: function (node) {
    var hasSiblings = node.previousSibling || node.nextSibling
    var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings

    return node.nodeName === 'CODE' && !isCodeBlock
  },

  pureAttributes: function (node, options) {
    // An inline code block must contain only text to be rendered as Markdown.
    node.renderAsPure = options.renderAsPure || (node.renderAsPure && node.firstChild.nodeType === 3 && node.childNodes.length === 1)
  },

  replacement: function (content) {
    if (!content) return ''
    content = content.replace(/\r?\n|\r/g, ' ')

    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? ' ' : ''
    var delimiter = '`'
    var matches = content.match(/`+/gm) || []
    while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`'

    return delimiter + extraSpace + content + extraSpace + delimiter
  }
}

rules.image = {
  filter: 'img',
  pureAttributes: {alt: undefined, src: undefined, title: undefined},

  replacement: function (content, node) {
    var alt = cleanAttribute(node.getAttribute('alt'))
    var src = node.getAttribute('src') || ''
    var title = cleanAttribute(node.getAttribute('title'))
    var titlePart = title ? ' "' + title + '"' : ''
    return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
  }
}

function cleanAttribute (attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : ''
}

export default rules
