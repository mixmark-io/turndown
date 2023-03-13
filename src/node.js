import { isBlock, isVoid, hasVoid, isMeaningfulWhenBlank, hasMeaningfulWhenBlank } from './utilities'

export default function Node (node, options) {
  node.isBlock = isBlock(node)
  node.isCode = node.nodeName === 'CODE' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node, options)
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
  const leadingWhiteSpaceMatch = string.match(/^(([ \t\r\n]*)(\s*))/)
  const isWhiteSpaceOnlyString = leadingWhiteSpaceMatch && leadingWhiteSpaceMatch[0].length === string.length
  if (isWhiteSpaceOnlyString) {
    return {
      leading: leadingWhiteSpaceMatch[1],
      leadingAscii: leadingWhiteSpaceMatch[2],
      leadingNonAscii: leadingWhiteSpaceMatch[3],
      trailing: '',
      trailingNonAscii: '',
      trailingAscii: ''
    }
  }
  const contentString = string.match(/^(\s*)(\S[\S\s]*)/)
  const leadingWhiteSpace = contentString ? contentString[1] : ''
  const content = contentString ? contentString[2] : ''
  const trailingText = string.substring(leadingWhiteSpace.length + content.trim().length)
  const trailingWhiteSpaceMatch = trailingText.match(/((\s*?)([ \t\r\n]*))$/)

  return {
    leading: leadingWhiteSpaceMatch ? leadingWhiteSpaceMatch[1] : '',
    leadingAscii: leadingWhiteSpaceMatch ? leadingWhiteSpaceMatch[2] : '',
    leadingNonAscii: leadingWhiteSpaceMatch ? leadingWhiteSpaceMatch[3] : '',
    trailing: trailingText,
    trailingNonAscii: trailingWhiteSpaceMatch ? trailingWhiteSpaceMatch[2] : '',
    trailingAscii: trailingWhiteSpaceMatch ? trailingWhiteSpaceMatch[3] : ''
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
