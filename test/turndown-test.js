var test = require('tape').test
var TurndownService = require('../lib/turndown.cjs')

function getDocument () {
  if (typeof window === 'undefined') {
    var jsdom = require('jsdom')
    var fs = require('fs')
    return jsdom.jsdom(
      fs.readFileSync('./test/index.html').toString()
    )
  } else {
    return document
  }
}

function runTestCase (testCase) {
  var testCaseName = testCase.getAttribute('data-name')
  var jsonOptions = testCase.getAttribute('data-options')
  var options = jsonOptions ? JSON.parse(jsonOptions) : {}
  var turndownService = new TurndownService(options)

  var inputElement = testCase.querySelector('.input')
  var expectedElement = testCase.querySelector('.expected')
  var expected = expectedElement.textContent
  var output = turndownService.turndown(inputElement)
  var outputElement = doc.createElement('pre')
  outputElement.className = 'output'
  testCase.insertBefore(outputElement, inputElement.nextSibling)
  outputElement.textContent = output

  var outputHeading = doc.createElement('h3')
  outputHeading.className = 'output-heading'
  outputHeading.textContent = 'output'
  testCase.insertBefore(outputHeading, outputElement)

  var heading = doc.createElement('h2')
  heading.className = 'test-case-heading'
  heading.textContent = testCaseName
  testCase.insertBefore(heading, inputElement)

  var inputHeading = doc.createElement('h3')
  inputHeading.className = 'input-heading'
  inputHeading.textContent = 'Input'
  testCase.insertBefore(inputHeading, inputElement)

  var expectedHeading = doc.createElement('h3')
  expectedHeading.className = 'expected-heading'
  expectedHeading.textContent = 'Expected Output'
  testCase.insertBefore(expectedHeading, expectedElement)

  if (output !== expected) {
    expectedElement.className += ' expected--err'
    expectedHeading.className += ' expected-heading--err'
    outputElement.className += ' output--err'
  }

  test(testCaseName + ' (DOM)', function (t) {
    t.plan(1)
    t.equal(output, expected)
  })

  test(testCaseName + ' (string)', function (t) {
    t.plan(1)
    t.equal(turndownService.turndown(inputElement.innerHTML), expected)
  })
}

var doc = getDocument()
var testCases = doc.querySelectorAll('.case')
for (var i = 0; i < testCases.length; i++) {
  runTestCase(testCases[i])
}

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

test('invalid options', function (t) {
  t.plan(1)
  t.throws(
    function () {
      new TurndownService({ headingStyle: 'foo' })
    },
    /- headingStyle needs to be either: setext or atx/
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
