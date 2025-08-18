import { isBlock, isVoid, hasVoid, isMeaningfulWhenBlank, hasMeaningfulWhenBlank } from './utilities'

export default function Node (node, options) {
  node.isBlock = isBlock(node)
  node.isCode = node.nodeName === 'CODE' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node, options)
  // When true, this node will be rendered as pure Markdown; false indicates it will be rendered using HTML. A value of true can indicate either that the source HTML can be perfectly captured as Markdown, or that the source HTML will be approximated as Markdown by discarding some HTML attributes (options.renderAsPure === true). Note that the value computed below is an initial estimate, which may be updated by a rule's `pureAttributes` property.
  node.renderAsPure = options.renderAsPure || node.attributes === undefined || node.attributes.length === 0
  // Given a dict of attributes that an HTML element may contain and still be convertable to pure Markdown, update the `node.renderAsPure` attribute. The keys of the dict define allowable attributes; the values define the value allowed for that key. If the value is `undefined`, then any value is allowed for the given key.
  node.addPureAttributes = (d) => {
    // Only perform this check if the node isn't pure and there's something to check. Note that `d.length` is always `undefined` (JavaScript is fun).
    if (!node.renderAsPure && Object.keys(d).length) {
      // Check to see how many of the allowed attributes match the actual attributes.
      let allowedLength = 0
      for (const [key, value] of Object.entries(d)) {
        if (key in node.attributes && (value === undefined || node.attributes[key].value === value)) {
          ++allowedLength
        }
      }
      // If the lengths are equal, then every attribute matched with an allowed attribute: this node is representable in pure Markdown.
      if (node.attributes.length === allowedLength) {
        node.renderAsPure = true
      }
    }
  }

  // Provide a means to escape HTML to confirm to Markdown's requirements. This happens only inside preformatted code blocks, where `collapseWhitespace` avoids removing newlines.
  node.cleanOuterHTML = () => node.outerHTML.replace(/\n/g, '&#10;').replace(/\r/g, '&#13;')
  // Output the provided string if `node.renderAsPure`; otherwise, output `node.outerHTML`.
  node.ifPure = (str) => node.renderAsPure ? str : node.cleanOuterHTML()
  return node
}

function isBlank (node) {
  return (
    !isVoid(node) &&
    !isMeaningfulWhenBlank(node) &&
    /^\s*$/i.test(node.textContent) &&
    !hasVoid(node) &&
    !hasMeaningfulWhenBlank(node)
  )
}

function flankingWhitespace (node, options) {
  if (node.isBlock || (options.preformattedCode && node.isCode)) {
    return { leading: '', trailing: '' }
  }

  var edges = edgeWhitespace(node.textContent)

  // abandon leading ASCII WS if left-flanked by ASCII WS
  if (edges.leadingAscii && isFlankedByWhitespace('left', node, options)) {
    edges.leading = edges.leadingNonAscii
  }

  // abandon trailing ASCII WS if right-flanked by ASCII WS
  if (edges.trailingAscii && isFlankedByWhitespace('right', node, options)) {
    edges.trailing = edges.trailingNonAscii
  }

  return { leading: edges.leading, trailing: edges.trailing }
}

function edgeWhitespace (string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/)
  return {
    leading: m[1], // whole string for whitespace-only strings
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4], // empty for whitespace-only strings
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  }
}

function isFlankedByWhitespace (side, node, options) {
  var sibling
  var regExp
  var isFlanked

  if (side === 'left') {
    sibling = node.previousSibling
    regExp = / $/
  } else {
    sibling = node.nextSibling
    regExp = /^ /
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue)
    } else if (options.preformattedCode && sibling.nodeName === 'CODE') {
      isFlanked = false
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}
