import { isBlock } from './utilities'

export default function Node (node) {
  node.isBlock = isBlock(node)
  node.isVoid = isVoid(node)
  node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node)
  return node
}

function isVoid (node) {
  return [
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ].indexOf(node.nodeName.toLowerCase()) !== -1
}

function isBlank (node) {
  return (
    !isVoid(node) &&
    ['A', 'TH', 'TD'].indexOf(node.nodeName) === -1 &&
    /^\s*$/i.test(node.textContent)
  )
}

function flankingWhitespace (node) {
  var leading = ''
  var trailing = ''

  if (!isBlock(node)) {
    var hasLeading = /^[ \r\n\t]/.test(node.textContent)
    var hasTrailing = /[ \r\n\t]$/.test(node.textContent)

    if (hasLeading && !isFlankedByWhitespace('left', node)) {
      leading = ' '
    }
    if (hasTrailing && !isFlankedByWhitespace('right', node)) {
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
