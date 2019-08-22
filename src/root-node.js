import collapseWhitespace from './collapse-whitespace'
import { isBlock, isVoid } from './utilities'

export default function RootNode (input) {
  var root = input.cloneNode(true)

  collapseWhitespace({
    element: root,
    isBlock: isBlock,
    isVoid: isVoid
  })

  return root
}
