/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011-14, Dom Christie
 * Licenced under the MIT licence
 *
 */

(function (global) {

  var ELEMENTS = {
    p: {
      name: tagName('p'),
      replacement: function (node) {
        return '\n' + trim(node.innerHTML) + '\n\n';
      }
    },

    br: {
      name: tagName('br'),
      replacement: '\n'
    },

    headers: {
      name: tagName('h[1-6]'),
      replacement: function(node) {
        var hLevel = Number(node.tagName.charAt(1));
        var hPrefix = '';
        for(var i = 0; i < hLevel; i++) {
          hPrefix += '#';
        }
        return '\n' + hPrefix + ' ' + trim(node.innerHTML) + '\n\n';
      }
    },

    hr: {
      name: tagName('hr'),
      replacement: '\n* * *\n\n'
    },

    em: {
      name: /^em$|^i$/i,
      replacement: function (node) {
        return '_' + trim(node.innerHTML) + '_';
      }
    },

    strong: {
      name: /^strong$|^b$/i,
      replacement: function (node) {
        return '**' + trim(node.innerHTML) + '**';
      }
    },

    code: {
      name: tagName('code'),
      replacement: function(node) {
        return '`' + node.innerHTML + '`';
      }
    },

    a: {
      name: tagName('a'),
      replacement: function(node) {
        var href = node.getAttribute('href');
        var title = node.title;
        var textPart = href ? '[' + node.innerHTML + ']' : '';
        var titlePart = title ? ' "'+ title +'"' : '';

        return href ? textPart + '(' + href + titlePart + ')' : node;
      }
    },

    img: {
      name: tagName('img'),
      replacement: function(node) {
        var alt = node.alt || '';
        var src = node.src || '';
        var title = node.title || '';
        var titlePart = title ? ' "'+ title +'"' : '';
        return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : node;
      }
    },
    pre: {
      name: tagName('pre'),
      replacement: function(node) {
        var innerHTML = node.innerHTML;
        if(/^\s*\`/.test(innerHTML)) {
          innerHTML = innerHTML.replace(/\`/g, '');
          return '    ' + innerHTML.replace(/\n/g, '\n    ');
        }
        else {
          return '';
        }
      }
    }
  };

  var VOID_ELEMENTS = [
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  var toMarkdown = function(input) {

    var clone = document.createElement('div');

    if (typeof input === 'string') {
      clone.innerHTML = input;
    }
    else if (isDomElement(input)) {
      clone.appendChild(input.cloneNode(true));
    }
    else {
      throw 'first argument needs to be an HTML string or a DOM element';
    }

    removeBlankTextNodes(clone);

    var nodes = bfsOrder(clone);

    // Loop through nodes in reverse (so deepest child element is first).
    // Replace nodes as necessary.
    for (var i = nodes.length - 1; i >= 0; i--) {
      var node = nodes[i];
      var replacement = replacementForNode(node);
      if (replacement) { node.parentNode.replaceChild(replacement, node); }
    }

    return clone.innerHTML.replace(/^[\t\r\n]+|[\t\r\n]+$/g, '')
                          .replace(/\n\s+\n/g, '\n\n')
                          .replace(/\n{3,}/g, '\n\n');
  };

  // =============
  // = Utilities =
  // =============

  function trim(string) {
    return string.replace(/^\s+|\s+$/g, '');
  }

  function isDomElement(o) {
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
  }

  function tagName(regExp) {
    return new RegExp('^' + regExp + '$', 'i');
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
        if (children[i].nodeType == 1) {
          inqueue.push(children[i]);
        }
      }
    }
    outqueue.shift();
    return outqueue;
  }

  // Loops through all ELEMENTS, checking to see if the node tagName matches.
  // Returns the replacement text node or null.
  function replacementForNode(node) {

    // Remove blank nodes
    if (VOID_ELEMENTS.indexOf(node.tagName.toLowerCase()) === -1 &&
        /^\s*$/i.test(node.innerHTML)) {
          return document.createTextNode('');
    }

    for (var key in ELEMENTS) {
      var tag = ELEMENTS[key];
      if (tag.name.test(node.tagName)) {
        var replacement = tag.replacement;
        var text;

        if (typeof replacement === 'function') {
          text = replacement.call(ELEMENTS, node);
        }
        else if (typeof replacement === 'string') {
          text = replacement;
        }
        else {
          throw '`replacement` needs to be a string or a function';
        }

        return document.createTextNode(text);
      }
    }
    return null;
  }

  function removeBlankTextNodes(node) {
    var child, next;
    switch (node.nodeType) {
      case 3: // Text node
        if (/^\s{2,}$/.test(node.nodeValue) &&
            node.parentNode.tagName !== 'PRE' &&
            node.parentNode.tagName !== 'CODE') {
              node.parentNode.removeChild(node);
            }
        break;
      case 1: // Element node
      case 9: // Document node
        child = node.firstChild;
        while (child) {
          next = child.nextSibling;
          removeBlankTextNodes(child);
          child = next;
        }
        break;
    }
  }

  if (typeof exports === 'object') {
    exports.toMarkdown = toMarkdown;
  }
  else {
    global.toMarkdown = toMarkdown;
  }
})(window);
