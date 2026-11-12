var test = require('tape').test
var rewire = require('rewire')
var turndownModule = rewire('../lib/turndown.cjs')

test('edge whitespace detection',function (t) {
  function ews (leadingAscii, leadingNonAscii, trailingNonAscii, trailingAscii) {
    return {
      leading: leadingAscii + leadingNonAscii,
      leadingAscii: leadingAscii,
      leadingNonAscii: leadingNonAscii,
      trailing: trailingNonAscii + trailingAscii,
      trailingNonAscii: trailingNonAscii,
      trailingAscii: trailingAscii
    }
  }
  var WS = '\r\n \t'
  var TEST_CASES = [
    [`${WS}HELLO WORLD${WS}`, ews(WS, '', '', WS)],
    [`${WS}H${WS}`, ews(WS, '', '', WS)],
    [`${WS}\xa0${WS}HELLO${WS}WORLD${WS}\xa0${WS}`, ews(WS, `\xa0${WS}`, `${WS}\xa0`, WS)],
    [`\xa0${WS}HELLO${WS}WORLD${WS}\xa0`, ews('', `\xa0${WS}`, `${WS}\xa0`, '')],
    [`\xa0${WS}\xa0`, ews('', `\xa0${WS}\xa0`, '', '')],
    [`${WS}\xa0${WS}`, ews(WS, `\xa0${WS}`, '', '')],
    [`${WS}\xa0`, ews(WS, `\xa0`, '', '')],
    [`HELLO WORLD`, ews('', '', '', '')],
    [``, ews('', '', '', '')],
    [`TEST${Array(32768).join(' ')}END`, ews('', '', '', '')], // performance check
  ]
  t.plan(TEST_CASES.length)
  t.timeoutAfter(300)
  var edgeWhitespace = turndownModule.__get__('edgeWhitespace')
  TEST_CASES.forEach(function (c) {
    t.deepEqual(edgeWhitespace(c[0]), c[1])
  })
})

test('falls back to body when Trusted Types strips x-turndown', function (t) {
  t.plan(1)
  var RealParser = turndownModule.__get__('HTMLParser')
  function StrippingParser () {}
  StrippingParser.prototype.parseFromString = function (string, type) {
    var doc = new RealParser().parseFromString(string, type)
    var wrapped = doc.getElementById('turndown-root')
    if (wrapped && wrapped.parentNode) {
      while (wrapped.firstChild) {
        wrapped.parentNode.insertBefore(wrapped.firstChild, wrapped)
      }
      wrapped.parentNode.removeChild(wrapped)
    }
    return doc
  }
  turndownModule.__set__('_htmlParser', new StrippingParser())
  try {
    t.equal(
      new turndownModule().turndown('<b>hello world</b>'),
      '**hello world**'
    )
  } finally {
    turndownModule.__set__('_htmlParser', undefined)
  }
})
