/*
 * Set up window for Node.js
 */

const root = (typeof window !== 'undefined' ? window : {})

/*
 * Parsing HTML strings
 */

function canParseHTMLNatively () {
  const Parser = root.DOMParser
  let canParse = false

  // Adapted from https://gist.github.com/1129031
  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if (new Parser().parseFromString('', 'text/html')) {
      canParse = true
    }
  } catch (e) {}

  return canParse
}

function createHTMLParser () {
  const Parser = function () {}

  if (process.browser) {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function (string) {
        const doc = new window.ActiveXObject('htmlfile')
        doc.designMode = 'on' // disable on-page scripts
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    } else {
      Parser.prototype.parseFromString = function (string) {
        const doc = document.implementation.createHTMLDocument('')
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    }
  } else {
    const domino = require('@mixmark-io/domino')
    Parser.prototype.parseFromString = function (string) {
      return domino.createDocument(string)
    }
  }
  return Parser
}

function shouldUseActiveX () {
  let useActiveX = false
  try {
    document.implementation.createHTMLDocument('').open()
  } catch (e) {
    if (root.ActiveXObject) useActiveX = true
  }
  return useActiveX
}

export default canParseHTMLNatively() ? root.DOMParser : createHTMLParser()
