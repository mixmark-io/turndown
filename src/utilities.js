export function extend (destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]
    for (var key in source) {
      if (source.hasOwnProperty(key)) destination[key] = source[key]
    }
  }
  return destination
}

export function repeat (character, count) {
  return Array(count + 1).join(character)
}

export function isBlock (node) {
  return [
    'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
    'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
    'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
    'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
    'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
  ].indexOf(node.nodeName.toLowerCase()) !== -1
}
