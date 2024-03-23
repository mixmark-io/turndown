var Attendant = require('turndown-attendant')
var TurndownService = require('../lib/turndown.cjs')

// TODO just for testing
process.env.PARSER = 'happy-dom'
// process.env.PARSER = 'parse5'
// process.env.PARSER = 'domino'

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
  t.equal(turndownService.use(function plugin () { }), turndownService)
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
