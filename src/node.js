import { isBlock, isVoid, hasVoid, isMeaningfulWhenBlank, hasMeaningfulWhenBlank } from './utilities'

export default function Node (node) {
  node.isBlock = isBlock(node)
  node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node)
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

function flankingWhitespace (node) {
  var leading = ''
  var trailing = ''

  if (!node.isBlock) {
    var hasLeading = /^\s/.test(node.textContent)
    var hasTrailing = /\s$/.test(node.textContent)
    var blankWithSpaces = node.isBlank && hasLeading && hasTrailing

    if (hasLeading && !isFlankedByWhitespace('left', node)) {
      leading = ' '
    }

    if (!blankWithSpaces && hasTrailing && !isFlankedByWhitespace('right', node)) {
      trailing = ' '
    }
  }

  return { leading: leading, trailing: trailing }
}

function isFlankedByWhitespace (side, node) {
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
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}
