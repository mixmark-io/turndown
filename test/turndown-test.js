var test = require('tape').test
var Attendant = require('turndown-attendant')
var TurndownService = require('../lib/turndown.cjs')

var attendant = new Attendant({
  file: __dirname + '/index.html',
  TurndownService: TurndownService
})

attendant.run()

test('malformed documents', function (t) {
  t.plan(0)
  var turndownService = new TurndownService
  turndownService.turndown('<HTML><head></head><BODY><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><body onload=alert(document.cookie);></body></html>')
  t.end()
})

test('null input', function (t) {
  t.plan(1)
  var turndownService = new TurndownService
  t.throws(
    function () { turndownService.turndown(null) }, /null is not a string/
  )
})

test('undefined input', function (t) {
  t.plan(1)
  var turndownService = new TurndownService
  t.throws(
    function () { turndownService.turndown(void (0)) },
    /undefined is not a string/
  )
})

test('#addRule returns the instance', function (t) {
  t.plan(1)
  var turndownService = new TurndownService
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
  var turndownService = new TurndownService
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
  var turndownService = new TurndownService
  t.equal(turndownService.use(function plugin () {}), turndownService)
})

test('#use with a single plugin calls the fn with instance', function (t) {
  t.plan(1)
  var turndownService = new TurndownService
  function plugin (service) {
    t.equal(service, turndownService)
  }
  turndownService.use(plugin)
})

test('#use with multiple plugins calls each fn with instance', function (t) {
  t.plan(2)
  var turndownService = new TurndownService
  function plugin1 (service) {
    t.equal(service, turndownService)
  }
  function plugin2 (service) {
    t.equal(service, turndownService)
  }
  turndownService.use([plugin1, plugin2])
})
