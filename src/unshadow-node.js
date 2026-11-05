// Form controls can shadow DOM properties on the form element itself
// (`<input id="parentNode">`). Reads and writes go through the prototype
// so those controls do not replace nodeType, childNodes, cloneNode, and the rest.

const rawMark = Symbol('turndownRawNode')
const proxies = new WeakMap()
const descriptors = new WeakMap()

function inheritedDescriptor (object, prop) {
  let proto = Object.getPrototypeOf(object)
  while (proto) {
    let bucket = descriptors.get(proto)
    if (!bucket) {
      bucket = new Map()
      descriptors.set(proto, bucket)
    }
    if (bucket.has(prop)) {
      const found = bucket.get(prop)
      if (found) return found
    } else {
      const desc = Object.getOwnPropertyDescriptor(proto, prop)
      bucket.set(prop, desc || false)
      if (desc) return desc
    }
    proto = Object.getPrototypeOf(proto)
  }
  return null
}

function realNodeType (value) {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return null
  const desc = inheritedDescriptor(value, 'nodeType')
  if (desc && typeof desc.get === 'function') return desc.get.call(value)
  // Browsers expose nodeType through a prototype getter.
  // Other DOM implementations keep a number on the node itself.
  if (typeof value.nodeType === 'number') return value.nodeType
  return null
}

function isNode (value) {
  return typeof realNodeType(value) === 'number'
}

function unwrap (value) {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return value
  return value[rawMark] || value
}

function wrapResult (value) {
  if (isNode(value)) return unshadow(value)
  return value
}

function isIndex (prop) {
  return typeof prop === 'string' && prop !== '' && String(Number(prop)) === prop
}

function unshadowList (list) {
  if (!list || (typeof list !== 'object' && typeof list !== 'function')) return list
  if (list[rawMark]) return list
  const existing = proxies.get(list)
  if (existing) return existing
  if (typeof Proxy !== 'function') return list

  const proxy = new Proxy(list, {
    get: function (target, prop) {
      if (prop === rawMark) return target
      if (isIndex(prop)) return unshadow(target[prop])
      return read(target, prop)
    }
  })
  proxies.set(list, proxy)
  return proxy
}

function read (target, prop) {
  const desc = inheritedDescriptor(target, prop)
  // Prototype getters and methods are the browser DOM. An own property with the
  // same name is a form control. Data properties stay on the node: Domino keeps
  // nodeType and NodeList length there.
  if (desc && typeof desc.get === 'function') {
    const value = desc.get.call(target)
    if (prop === 'childNodes' || prop === 'children') return unshadowList(value)
    return wrapResult(value)
  }
  if (desc && typeof desc.value === 'function') {
    return function () {
      const args = Array.prototype.map.call(arguments, unwrap)
      return wrapResult(desc.value.apply(target, args))
    }
  }
  const value = target[prop]
  return isNode(value) ? unshadow(value) : value
}

function write (target, prop, value) {
  const desc = inheritedDescriptor(target, prop)
  if (desc && typeof desc.set === 'function') {
    desc.set.call(target, unwrap(value))
    return true
  }
  target[prop] = value
  return true
}

function unshadow (node) {
  if (!isNode(node)) return node
  if (node[rawMark]) return node
  const existing = proxies.get(node)
  if (existing) return existing
  if (typeof Proxy !== 'function') return node

  const proxy = new Proxy(node, {
    get: function (target, prop) {
      if (prop === rawMark) return target
      return read(target, prop)
    },
    set: function (target, prop, value) {
      return write(target, prop, value)
    }
  })
  proxies.set(node, proxy)
  return proxy
}

export { realNodeType, unshadow }
