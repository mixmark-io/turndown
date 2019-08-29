import TurndownCoreService from 'turndown-core'
import HTMLParser from './html-parser'

// Inherit from Turndown Core
export default function TurndownService (options) {
  TurndownCoreService.call(this, options)
}
TurndownService.prototype = Object.create(TurndownCoreService.prototype)
TurndownService.prototype.constructor = TurndownService

// Store the `turndown` method from Turndown Core
var turndown = TurndownService.prototype.turndown

// Override the `turndown` method by parsing strings if necessary
TurndownService.prototype.turndown = function (input) {
  if (!canConvert(input)) {
    throw new TypeError(
      input + ' is not a string, or an element/document/fragment node.'
    )
  }

  if (typeof input === 'string') {
    if (input === '') return ''
    input = parse(input)
  }

  // Super
  return turndown.call(this, input)
}

function parse (input) {
  var doc = htmlParser().parseFromString(
    // DOM parsers arrange elements in the <head> and <body>.
    // Wrapping in a custom element ensures elements are reliably arranged in
    // a single element.
    '<x-turndown id="turndown-root">' + input + '</x-turndown>',
    'text/html'
  )
  return doc.getElementById('turndown-root')
}

var _htmlParser
function htmlParser () {
  _htmlParser = _htmlParser || new HTMLParser()
  return _htmlParser
}

function canConvert (input) {
  return (
    input != null && (
      typeof input === 'string' ||
      (input.nodeType && (
        input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
      ))
    )
  )
}
