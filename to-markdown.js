/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011-14, Dom Christie
 * Licenced under the MIT licence
 *
 */

if (typeof he !== 'object' && typeof require === 'function') {
  var he = require('he');
}

(function (root) {
  'use strict';

  var toMarkdown = {};
  var _document;

  if (typeof module !== 'undefined' && module.exports) {
    _document = require('jsdom').jsdom();
    exports.toMarkdown = toMarkdown;
  }
  else {
    _document = document;
    root.toMarkdown = toMarkdown;
  }

  var converters = [
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

  var VOID_ELEMENTS = [
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  toMarkdown.makeMD = function(input, options) {

    if (typeof input !== 'string') {
      throw 'first argument needs to be an HTML string';
    }

    // Add any custom converters to the front of the array
    if (options && options.converters) {
      converters = options.converters.concat(converters);
    }

    // Escape potential ol triggers
    input = input.replace(/(\d+)\. /g, '$1\\. ');

    var clone = _document.createElement('div');
    clone.innerHTML = input;
    removeBlankNodes(clone);

    var nodes = bfsOrder(clone);

    // Loop through nodes in reverse (so deepest child elements are first).
    // Replace nodes as necessary.
    for (var i = nodes.length - 1; i >= 0; i--) {
      var node = nodes[i];
      var replacement = replacementForNode(node);
      if (replacement) { node.parentNode.replaceChild(replacement, node); }
    }

    var output = he.decode(clone.innerHTML);

    return output.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
                 .replace(/\n\s+\n/g, '\n\n')
                 .replace(/\n{3,}/g, '\n\n');
  };

  // =============
  // = Utilities =
  // =============

  function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
  }

  function trim(string) {
    return string.replace(/^\s+|\s+$/g, '');
  }

  // Flattens node tree into a single array
  function bfsOrder(root) {
    var inqueue = [root];
    var outqueue = [];
    while (inqueue.length > 0) {
      var elem = inqueue.shift();
      outqueue.push(elem);
      var children = elem.childNodes;
      for (var i = 0 ; i < children.length; i++) {
        if (children[i].nodeType === 1) {
          inqueue.push(children[i]);
        }
      }
    }
    outqueue.shift();
    return outqueue;
  }

  // Loops through all converters, checking to see if the node tagName matches.
  // Returns the replacement text node or null.
  function replacementForNode(node) {

    // Remove blank nodes
    if (VOID_ELEMENTS.indexOf(node.tagName.toLowerCase()) === -1 &&
        /^\s*$/i.test(node.innerHTML)) {
      return _document.createTextNode('');
    }

    for (var i = 0; i < converters.length; i++) {
      var converter = converters[i];

      if (canConvertNode(node, converter.filter)) {
        var replacement = converter.replacement;
        var text;

        if (typeof replacement !== 'function') {
          throw '`replacement` needs to be a function that returns a string';
        }

        text = replacement(he.decode(node.innerHTML), node);

        return _document.createTextNode(text);
      }
    }
    return null;
  }

  function canConvertNode(node, filter) {
    if (isRegExp(filter)) {
      return filter.test(node.tagName);
    }
    else if (typeof filter === 'string') {
      return new RegExp('^' + filter + '$', 'i').test(node.tagName);
    }
    else if (typeof filter === 'function') {
      return filter(node);
    }
    else {
      throw '`filter` needs to be a RegExp, string, or function';
    }
  }

  function removeBlankNodes(node) {
    var child, next;
    switch (node.nodeType) {
      case 8: // Comment node
        node.parentNode.removeChild(node);
        break;
      case 3: // Text node
        if (node.parentNode.tagName !== 'PRE' &&
            node.parentNode.tagName !== 'CODE') {
          var value = node.nodeValue;
          if (/\S/.test(value)) {
            node.nodeValue = value.replace(/^[\n\r\t\f]+[\s]*|\s+$/gm, '');
          }
          else {
            node.parentNode.removeChild(node);
          }
        }
        break;
      case 1: // Element node
      case 9: // Document node
        child = node.firstChild;
        while (child) {
          next = child.nextSibling;
          removeBlankNodes(child);
          child = next;
        }
        break;
    }
  }
})(this);
