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
  ]
  t.plan(TEST_CASES.length)
  var edgeWhitespace = turndownModule.__get__('edgeWhitespace')
  TEST_CASES.forEach(function (c) {
    t.deepEqual(edgeWhitespace(c[0]), c[1])
  })
})
