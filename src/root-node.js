import collapseWhitespace from './collapse-whitespace'
import HTMLParser from './html-parser'
import { isBlock, isVoid } from './utilities'

export default function RootNode (input, options) {
  var root
  if (typeof input === 'string') {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + '</x-turndown>',
      'text/html'
    )
    root = doc.getElementById('turndown-root')
  } else {
    root = input.cloneNode(true)
  }
  normalizePre(root)
  collapseWhitespace({
    element: root,
    isBlock: isBlock,
    isVoid: isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  })

  return root
}

var _htmlParser
function htmlParser () {
  _htmlParser = _htmlParser || new HTMLParser()
  return _htmlParser
}

function isPreOrCode (node) {
  return node.nodeName === 'PRE' || node.nodeName === 'CODE'
}

function normalizePre (root) {
  if (!root.getElementsByTagName) {
    return // unsupported DOM method
  }
  var preNodes = root.getElementsByTagName('PRE')
  for (var i = 0; i < preNodes.length; i++) {
    var brNodes = preNodes[i].getElementsByTagName('BR')
    while (brNodes.length > 0) {
      brNodes[0].parentNode.replaceChild(
        brNodes[0].ownerDocument.createTextNode('\n'),
        brNodes[0]
      )
    }
  }
}
