'use strict';

function cell(content, node) {
  var index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
  var prefix = ' ';
  if (index === 0) { prefix = '| '; }
  return prefix + content + ' |';
}

module.exports = [
  {
    filter: /^del$|^s$|^strike$/i,
    replacement: function (innerHTML) {
      return '~~' + innerHTML + '~~';
    }
  },

  {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.tagName === 'LI'
    },
    replacement: function (innerHTML, node) {
      return (node.checked ? '[x]' : '[ ]') + ' ';
    }
  },

  {
    filter: /^th$|^td$/i,
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
    filter: /^table$|^thead$|^tbody$|^tfoot$/i,
    replacement: function (innerHTML) {
      return innerHTML;
    }
  }
];
