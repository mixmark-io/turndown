'use strict';

module.exports = [
  {
    filter: 'p',
    replacement: function (innerHTML) {
      return '\n' + innerHTML + '\n\n';
    }
  },

  {
    filter: 'br',
    replacement: function () {
      return '  \n';
    }
  },

  {
    filter: ['h1', 'h2', 'h3', 'h4','h5', 'h6'],
    replacement: function(innerHTML, node) {
      var hLevel = node.nodeName.charAt(1);
      var hPrefix = '';
      for(var i = 0; i < hLevel; i++) {
        hPrefix += '#';
      }
      return '\n' + hPrefix + ' ' + innerHTML + '\n\n';
    }
  },

  {
    filter: 'hr',
    replacement: function () {
      return '\n* * *\n\n';
    }
  },

  {
    filter: ['em', 'i'],
    replacement: function (innerHTML) {
      return '_' + innerHTML + '_';
    }
  },

  {
    filter: ['strong', 'b'],
    replacement: function (innerHTML) {
      return '**' + innerHTML + '**';
    }
  },

  // Inline code
  {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling;
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

      return node.nodeName === 'CODE' && !isCodeBlock;
    },
    replacement: function(innerHTML) {
      return '`' + innerHTML + '`';
    }
  },

  {
    filter: 'a',
    replacement: function(innerHTML, node) {
      var href = node.getAttribute('href');
      var title = node.title;
      var textPart = href ? '[' + innerHTML + ']' : '';
      var titlePart = title ? ' "'+ title +'"' : '';

      if (href) {
        return textPart + '(' + href + titlePart + ')';
      }
      else {
        return node.outerHTML;
      }
    }
  },

  {
    filter: 'img',
    replacement: function(innerHTML, node) {
      var alt = node.alt || '';
      var src = node.getAttribute('src') || '';
      var title = node.title || '';
      var titlePart = title ? ' "'+ title +'"' : '';
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : '';
    }
  },

  // Code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild.nodeName === 'CODE';
    },
    replacement: function(innerHTML, node) {
      innerHTML = this.decodeHTMLEntities(node.firstChild.innerHTML);
      return '\n    ' + innerHTML.replace(/\n/g, '\n    ') + '\n\n';
    }
  },

  {
    filter: 'blockquote',
    replacement: function (innerHTML) {
      innerHTML = this.trim(innerHTML);
      innerHTML = innerHTML.replace(/\n{3,}/g, '\n\n');
      innerHTML = innerHTML.replace(/^/gm, '> ');
      return '\n' + innerHTML + '\n\n';
    }
  },

  {
    filter: 'li',
    replacement: function (innerHTML, node) {
      innerHTML = innerHTML.replace(/^\s+/, '').replace(/\n/gm, '\n    ');
      var prefix = '*   ';
      var parent = node.parentNode;
      var index = Array.prototype.indexOf.call(parent.children, node) + 1;

      prefix = /ol/i.test(parent.nodeName) ? index + '.  ' : '*   ';
      return prefix + innerHTML;
    }
  },

  {
    filter: ['ul', 'ol'],
    replacement: function (innerHTML, node) {
      var strings = [];
      for (var i = 0; i < node.childNodes.length; i++) {
        strings.push(node.childNodes[i].nodeValue);
      }

      if (/li/i.test(node.parentNode.nodeName)) {
        return '\n' + strings.join('\n');
      }
      return '\n' + strings.join('\n') + '\n\n';
    }
  },

  {
    filter: function (node) {
      return this.isBlock(node);
    },
    replacement: function (innerHTML, node) {
      return '\n' + this.decodeHTMLEntities(node.outerHTML) + '\n\n';
    }
  }
];