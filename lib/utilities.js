'use strict';

exports.isRegExp = function (obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var blockRegex = /^(address|article|aside|audio|blockquote|body|canvas|center|dd|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frameset|h[1-6]|header|hgroup|hr|html|isindex|li|main|menu||nav|noframes|noscript|ol|output|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)$/i;
exports.isBlockLevel = function (node) {
  return blockRegex.test(node.nodeName);
};
