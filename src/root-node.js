import collapse from 'collapse-whitespace'
import HTMLParser from './html-parser'
import { isBlock } from './utilities'

export default function RootNode (input) {
  var root
  if (typeof input === 'string') {
    root = htmlParser().parseFromString(input, 'text/html').body
  } else {
    root = input.cloneNode(true)
  }
  collapse(root, isBlock)

  return root
}

var _htmlParser
function htmlParser () {
  _htmlParser = _htmlParser || new HTMLParser()
  return _htmlParser
}
