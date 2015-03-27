'use strict';

var doc = require('./document');
var root = (typeof window !== 'undefined' ? window : this);

var Parser = root.DOMParser || function () {};
var canParseHtml = false;

// Adapted from https://gist.github.com/1129031
// Firefox/Opera/IE throw errors on unsupported types
try {
  // WebKit returns null on unsupported types
  if (new Parser().parseFromString('', 'text/html')) {
    canParseHtml = true;
  }
} catch (e) {}

if (!canParseHtml) {
  Parser.prototype.parseFromString = function (input) {
    var newDoc = doc.implementation.createHTMLDocument('');

    if (input.toLowerCase().indexOf('<!doctype') > -1) {
      newDoc.documentElement.innerHTML = input;
    }
    else {
      newDoc.body.innerHTML = input;
    }
    return newDoc;
  };
}

module.exports = function (input) {
  return new Parser().parseFromString(input, 'text/html');
};
