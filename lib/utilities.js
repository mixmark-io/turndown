'use strict';

exports.trim = function (string) {
  return string.replace(/^[ \r\n\t]+|[ \r\n\t]+$/g, '');
};

var blocks = ['address', 'article', 'aside', 'audio', 'blockquote', 'body',
              'canvas', 'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset',
              'figcaption', 'figure', 'footer', 'form', 'frameset', 'h1', 'h2',
              'h3', 'h4','h5', 'h6', 'header', 'hgroup', 'hr', 'html',
              'isindex', 'li', 'main', 'menu', 'nav', 'noframes', 'noscript',
              'ol', 'output', 'p', 'pre', 'section', 'table', 'tbody', 'td',
              'tfoot', 'th', 'thead', 'tr', 'ul'];

exports.isBlock = function (node) {
  return blocks.indexOf(node.nodeName.toLowerCase()) !== -1;
};
