/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011-15, Dom Christie
 * Licenced under the MIT licence
 *
 */

'use strict';

var htmlToDom = require('./lib/html-to-dom');
var converters;
var mdConverters = require('./lib/md-converters');
var gfmConverters = require('./lib/gfm-converters');
var utilities = require('./lib/utilities');

var isBlock = utilities.isBlock;
var trim = utilities.trim;
var decodeHTMLEntities = require('he').decode;

var VOID_ELEMENTS = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

var toMarkdown;

module.exports = toMarkdown = function (input, options) {
  options = options || {};

  if (typeof input !== 'string') {
    throw new TypeError(input + ' is not a string');
  }

  // Escape potential ol triggers
  input = input.replace(/(\d+)\. /g, '$1\\. ');

  var doc = htmlToDom(input);
  var clone = doc.body;

  // Flattens node tree into a single array
  var nodes = bfsOrder(clone);

  converters = options.gfm ? gfmConverters.concat(mdConverters) : mdConverters;

  // Loop through nodes in reverse (so deepest child elements are first).
  // Replace nodes as necessary.
  for (var i = nodes.length - 1; i >= 0; i--) {
    var node = nodes[i];
    var replacement = replacementForNode(node, doc);
    if (replacement) { node.parentNode.replaceChild(replacement, node); }
  }

  var output = decodeHTMLEntities(clone.innerHTML);

  return output.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
               .replace(/\n\s+\n/g, '\n\n')
               .replace(/\n{3,}/g, '\n\n');
};

toMarkdown.decodeHTMLEntities = decodeHTMLEntities;
toMarkdown.isBlock = isBlock;
toMarkdown.trim = trim;

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

function canConvertNode(node, filter) {
  if (typeof filter === 'string') {
    return filter === node.nodeName.toLowerCase();
  }
  if (Array.isArray(filter)) {
    return filter.indexOf(node.nodeName.toLowerCase()) !== -1;
  }
  else if (typeof filter === 'function') {
    return filter.call(toMarkdown, node);
  }
  else {
    throw '`filter` needs to be a string, array, or function';
  }
}

function isFlankedByExternalSpace(direction, node) {
  var sibling,
      regExp,
      flankedBySpace,
      flankedBySpaceInInlineElement;

  if (direction === 'left') {
    sibling = node.previousSibling;
    regExp = / $/;
  }
  else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      flankedBySpace = regExp.test(sibling.nodeValue);
    }
    else if(sibling.nodeType === 1 && !isBlock(sibling)) {
      flankedBySpaceInInlineElement = regExp.test(node.textContent || node.innertext);
    }
  }
  return flankedBySpace || flankedBySpaceInInlineElement;
}

// Loops through all md converters, checking to see if the node nodeName matches.
// Returns the replacement text node or null.
function replacementForNode(node, doc) {

  // Remove blank nodes
  if (VOID_ELEMENTS.indexOf(node.nodeName.toLowerCase()) === -1 && /^\s*$/i.test(node.innerHTML)) {
    return doc.createTextNode('');
  }

  for (var i = 0; i < converters.length; i++) {
    var converter = converters[i];

    if (canConvertNode(node, converter.filter)) {
      var replacement = converter.replacement;
      var text;
      var textNode;
      var leadingSpace = '';
      var trailingSpace = '';

      if (typeof replacement !== 'function') {
        throw '`replacement` needs to be a function that returns a string';
      }

      if (!isBlock(node)) {
        var hasLeadingWhitespace = /^[ \r\n\t]/.test(node.innerHTML);
        var hasTrailingWhitespace = /[ \r\n\t]$/.test(node.innerHTML);

        node.innerHTML = trim(node.innerHTML);

        if (hasLeadingWhitespace && !isFlankedByExternalSpace('left', node)) {
          leadingSpace = ' ';
        }
        if (hasTrailingWhitespace && !isFlankedByExternalSpace('right', node)) {
          trailingSpace = ' ';
        }
      }

      text = replacement.call(toMarkdown, decodeHTMLEntities(node.innerHTML), node);
      textNode = doc.createTextNode(leadingSpace + text + trailingSpace);
      textNode._attributes = node.attributes;

      return textNode;
    }
  }
  return null;
}
