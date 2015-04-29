'use strict';

function cell(content, node) {
  var index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
  var prefix = ' ';
  if (index === 0) { prefix = '| '; }
  return prefix + content + ' |';
}

var highlightRegEx = /highlight highlight-(\S+)/;

module.exports = [
  {
    filter: 'br',
    replacement: function () {
      return '\n';
    }
  },
  {
    filter: ['del', 's', 'strike'],
    replacement: function (innerHTML) {
      return '~~' + innerHTML + '~~';
    }
  },

  {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.tagName === 'LI';
    },
    replacement: function (innerHTML, node) {
      return (node.checked ? '[x]' : '[ ]') + ' ';
    }
  },

  {
    filter: ['th', 'td'],
    replacement: function (innerHTML, node) {
      return cell(innerHTML, node);
    }
  },

  {
    filter: 'tr',
    replacement: function (innerHTML, node) {
      var borderCells = '';
      var alignMap = { left: ':--', right: '--:' };

      if (node.parentNode.tagName === 'THEAD') {
        for (var i = 0; i < node.childNodes.length; i++) {
          var childNode = node.childNodes[i];
          var align = childNode._attributes.align;
          var border = '---';

          if (align) { border = alignMap[align.value]; }

          borderCells += cell(border, node.childNodes[i]);
        }
      }
      return '\n' + innerHTML + (borderCells ? '\n' + borderCells : '');
    }
  },

  {
    filter: 'table',
    replacement: function (innerHTML) {
      return '\n' + innerHTML + '\n\n';
    }
  },

  {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function (innerHTML) {
      return innerHTML;
    }
  },

  // Fenced code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
             node.firstChild &&
             node.firstChild.nodeName === 'CODE';
    },
    replacement: function(innerHTML, node) {
      innerHTML = this.decodeHTMLEntities(node.firstChild.innerHTML);
      return '\n```\n' + innerHTML + '\n```\n\n';
    }
  },

  // Syntax-highlighted code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
             node.parentNode.nodeName === 'DIV' &&
             highlightRegEx.test(node.parentNode.className);
    },
    replacement: function (innerHTML, node) {
      var language = node.parentNode.className.match(highlightRegEx)[1];
      innerHTML = this.decodeHTMLEntities(node.textContent);
      return '\n```' + language + '\n' + innerHTML + '\n```\n\n';
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'DIV' &&
             highlightRegEx.test(node.className);
    },
    replacement: function (innerHTML) {
      return '\n' + innerHTML + '\n\n';
    }
  }
];
