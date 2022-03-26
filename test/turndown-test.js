var Attendant = require('turndown-attendant')
var TurndownService = require('../lib/turndown.cjs')
var fc = require('fast-check')
var Md = require('markdown-it')

var attendant = new Attendant({
  file: __dirname + '/index.html',
  TurndownService: TurndownService
})
var test = attendant.test

attendant.run()

test('malformed documents', function (t) {
  t.plan(0)
  var turndownService = new TurndownService()
  turndownService.turndown('<HTML><head></head><BODY><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><body onload=alert(document.cookie);></body></html>')
  t.end()
})

test('null input', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  t.throws(
    function () { turndownService.turndown(null) }, /null is not a string/
  )
})

test('undefined input', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  t.throws(
    function () { turndownService.turndown(void (0)) },
    /undefined is not a string/
  )
})

test('#addRule returns the instance', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  var rule = {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  }
  t.equal(turndownService.addRule('strikethrough', rule), turndownService)
})

test('#addRule adds the rule', function (t) {
  t.plan(2)
  var turndownService = new TurndownService()
  var rule = {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  }
  // Assert rules#add is called
  turndownService.rules.add = function (key, r) {
    t.equal(key, 'strikethrough')
    t.equal(rule, r)
  }
  turndownService.addRule('strikethrough', rule)
})

test('#use returns the instance for chaining', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  t.equal(turndownService.use(function plugin () {}), turndownService)
})

test('#use with a single plugin calls the fn with instance', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  function plugin (service) {
    t.equal(service, turndownService)
  }
  turndownService.use(plugin)
})

test('#use with multiple plugins calls each fn with instance', function (t) {
  t.plan(2)
  var turndownService = new TurndownService()
  function plugin1 (service) {
    t.equal(service, turndownService)
  }
  function plugin2 (service) {
    t.equal(service, turndownService)
  }
  turndownService.use([plugin1, plugin2])
})

test('#keep keeps elements as HTML', function (t) {
  t.plan(2)
  var turndownService = new TurndownService()
  var input = '<p>Hello <del>world</del><ins>World</ins></p>'

  // Without `.keep(['del', 'ins'])`
  t.equal(turndownService.turndown(input), 'Hello worldWorld')

  // With `.keep(['del', 'ins'])`
  turndownService.keep(['del', 'ins'])
  t.equal(
    turndownService.turndown('<p>Hello <del>world</del><ins>World</ins></p>'),
    'Hello <del>world</del><ins>World</ins>'
  )
})

test('#keep returns the TurndownService instance for chaining', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  t.equal(turndownService.keep(['del', 'ins']), turndownService)
})

test('keep rules are overridden by the standard rules', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  turndownService.keep('p')
  t.equal(turndownService.turndown('<p>Hello world</p>'), 'Hello world')
})

test('keeping elements that have a blank textContent but contain significant elements', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  turndownService.keep('figure')
  t.equal(
    turndownService.turndown('<figure><iframe src="http://example.com"></iframe></figure>'),
    '<figure><iframe src="http://example.com"></iframe></figure>'
  )
})

test('keepReplacement can be customised', function (t) {
  t.plan(1)
  var turndownService = new TurndownService({
    keepReplacement: function (content, node) {
      return '\n\n' + node.outerHTML + '\n\n'
    }
  })
  turndownService.keep(['del', 'ins'])
  t.equal(turndownService.turndown(
    '<p>Hello <del>world</del><ins>World</ins></p>'),
    'Hello \n\n<del>world</del>\n\n<ins>World</ins>'
  )
})

test('#remove removes elements', function (t) {
  t.plan(2)
  var turndownService = new TurndownService()
  var input = '<del>Please redact me</del>'

  // Without `.remove('del')`
  t.equal(turndownService.turndown(input), 'Please redact me')

  // With `.remove('del')`
  turndownService.remove('del')
  t.equal(turndownService.turndown(input), '')
})

test('#remove returns the TurndownService instance for chaining', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  t.equal(turndownService.remove(['del', 'ins']), turndownService)
})

test('remove elements are overridden by rules', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  turndownService.remove('p')
  t.equal(turndownService.turndown('<p>Hello world</p>'), 'Hello world')
})

test('remove elements are overridden by keep', function (t) {
  t.plan(1)
  var turndownService = new TurndownService()
  turndownService.keep(['del', 'ins'])
  turndownService.remove(['del', 'ins'])
  t.equal(turndownService.turndown(
      '<p>Hello <del>world</del><ins>World</ins></p>'),
    'Hello <del>world</del><ins>World</ins>'
  )
})

// Property based tests

function arbitraryHtml (opts) {
  let { spans, divs, hr, br, unclosedP } = Object.assign({
    spans: ['em', 'i', 'strong', 'b', 'span', 'q'],
    divs: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    hr: true,
    br: true,
    unclosedP: true
  }, opts)
  const pseudoDom = fc.letrec(rec => {
    let spanOpts = [
      fc.lorem(),
      fc.array(rec('span'), {
        minLength: 1
      })
    ]
    if (br) {
      spanOpts.push(fc.lorem().map(s => `${s}<br/>`))
    }
    if (spans.length > 0) {
      spanOpts.push(fc.record({
        tag: fc.constantFrom(...spans),
        content: rec('span')
      }))
    }
    let span = fc.oneof({ depthFactor: 0.5, withCrossShrink: true }, ...spanOpts)
    let divOpts = []
    if (hr) {
      divOpts.push(fc.constant('<hr/>'))
    }
    if (unclosedP) {
      divOpts.push(fc.lorem().map(s => `<p>${s}`))
    }
    if (divs.length > 0) {
      divOpts.push(fc.record({
        tag: fc.constantFrom(...divs),
        content: rec('span')
      }))
    }

    let div = fc.oneof(...divOpts)
    return {
      tree: fc.oneof(rec('span'), rec('div')),
      span: span,
      div: div
    }
  }).tree
  const flatten = (tree) => {
    if (Array.isArray(tree)) {
      return tree.map(flatten).join(' ')
    } else if (typeof tree === 'string') {
      return tree
    } else {
      return `<${tree.tag}>${flatten(tree.content)}</${tree.tag}>`
    }
  }
  return pseudoDom.map(flatten)
}

test('arbitraryHtml sanity check', (t) => {
  let n = 0
  fc.assert(
    fc.property(arbitraryHtml(), fc.context(), (html, ctx) => {
      ctx.log(`HTML: ${JSON.stringify(html)}`)
      n += 1
      t.plan(n)
      t.equal(typeof html, 'string')
    })
  )
})

// Full-blown inverse would be f(g(x)) = x, but to account for bytewise diffs, but semantic
// equivalence, we use a set of conditions listed in:
// https://hypothesis.works/articles/canonical-serialization/
test('Round Trip', (t) => {
  let mdIt = new Md()
  let turndownService = new TurndownService()
  let normalize = (s) => {
    return mdIt.render(turndownService.turndown(s))
  }
  let compare = (left, right) => {
    if (left !== right) {
      throw new Error(`left:\n<<<\n${left}\n>>>\nright:\n<<<\n${right}\n>>>`)
    }
  }
  fc.assert(
    fc.property(arbitraryHtml(), fc.context(), (html, ctx) => {
      ctx.log(`HTML: ${JSON.stringify(html)}`)
      let markdown = turndownService.turndown(html)
      compare(markdown, turndownService.turndown(normalize(html)))
      compare(normalize(html), normalize(normalize(html)))
    })
  )
  t.end()
})
