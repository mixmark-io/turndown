'use strict';

var _document = require('./document');
var trim = require('./utilities').trim;

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
    filter: 'h[1-6]',
    replacement: function(innerHTML, node) {
      var hLevel = node.tagName.charAt(1);
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
    filter: /^em$|^i$/i,
    replacement: function (innerHTML) {
      return '_' + innerHTML + '_';
    }
  },

  {
    filter: /^strong$|^b$/i,
    replacement: function (innerHTML) {
      return '**' + innerHTML + '**';
    }
  },

  {
    filter: 'code',
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
        var dummy = _document.createElement('div');
        dummy.appendChild(node.cloneNode(true));
        return dummy.innerHTML;
      }
    }
  },

  {
    filter: 'img',
    replacement: function(innerHTML, node) {
      var alt = node.alt || '';
      var src = node.src || '';
      var title = node.title || '';
      var titlePart = title ? ' "'+ title +'"' : '';
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : node;
    }
  },

  {
    filter: 'pre',
    replacement: function(innerHTML) {
      if(/^\s*\`/.test(innerHTML)) {
        innerHTML = innerHTML.replace(/\`/g, '');
        return '    ' + innerHTML.replace(/\n/g, '\n    ');
      }
      else {
        return '';
      }
    }
  },

  {
    filter: 'blockquote',
    replacement: function (innerHTML) {
      innerHTML = trim(innerHTML);
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
      var index = Array.prototype.indexOf.call(parent.childNodes, node) + 1;

      prefix = /ol/i.test(parent.tagName) ? index + '.  ' : '*   ';
      return prefix + innerHTML;
    }
  },

  {
    filter: /^ul$|^ol$/i,
    replacement: function (innerHTML, node) {
      var strings = [];
      for (var i = 0; i < node.childNodes.length; i++) {
        strings.push(node.childNodes[i].nodeValue);
      }

      if (/li/i.test(node.parentNode.tagName)) {
        return '\n' + strings.join('\n');
      }
      return '\n' + strings.join('\n') + '\n\n';
    }
  }
];