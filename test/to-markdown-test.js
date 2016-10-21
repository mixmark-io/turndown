/* global QUnit, test, expect, equal, throws, asyncTest, start */

'use strict'

if (typeof module !== 'undefined' && module.exports) {
  var toMarkdown = require('../index')
}

// Test cases are in the format: [html, expectedMarkdown, message]
function runTestCases (testCases) {
  for (var i = 0; i < testCases.length; i++) {
    var testCase = testCases[i]
    equal(toMarkdown(testCase[0]), testCase[1], testCase[2])
  }
}

QUnit.module('Markdown')

test('paragraphs', function () {
  runTestCases([
    ['<p>Lorem ipsum</p>', 'Lorem ipsum', 'p'],
    ['<p>Lorem</p><p>ipsum</p>', 'Lorem\n\nipsum', 'Multiple ps']
  ])
})

test('emphasis', function () {
  runTestCases([
    ['<b>Hello world</b>', '**Hello world**', 'b'],
    ['<strong>Hello world</strong>', '**Hello world**', 'strong'],
    ['<i>Hello world</i>', '_Hello world_', 'i'],
    ['<em>Hello world</em>', '_Hello world_', 'em'],
    ['<em>Hello</em> <em>world</em>', '_Hello_ _world_', 'Multiple ems']
  ])
})

test('code', function () {
  runTestCases([
    ['<code>print()</code>', '`print()`']
  ])
})

test('headings', function () {
  runTestCases([
    ['<h1>Hello world</h1>', '# Hello world', 'h1'],
    ['<h3>Hello world</h3>', '### Hello world', 'h3'],
    ['<h6>Hello world</h6>', '###### Hello world', 'h6'],
    ['<h4><i>Hello</i> world</h4>', '#### _Hello_ world', 'h4 with child'],
    ['<h8>Hello world</h8>', '<h8>Hello world</h8>', 'invalid heading']
  ])
})

test('horizontal rules', function () {
  runTestCases([
    ['<hr />', '* * *', 'hr'],
    ['<hr></hr>', '* * *', 'open/closed hr']
  ])
})

test('line breaks', function () {
  runTestCases([
    ['Hello<br />world', 'Hello  \nworld']
  ])
})

test('images', function () {
  runTestCases([
    ['<img src="http://example.com/logo.png" />', '![](http://example.com/logo.png)', 'img with no alt'],
    ['<img src=logo.png>', '![](logo.png)', 'img with relative src'],
    ['<img src=logo.png alt="Example logo">', '![Example logo](logo.png)', 'img with alt'],
    ['<img>', '', 'img no src']
  ])
})

test('anchors', function () {
  runTestCases([
    ['<a href="http://example.com/about">About us</a>', '[About us](http://example.com/about)', 'a'],
    ['<a href="http://example.com/about" title="About this company">About us</a>', '[About us](http://example.com/about "About this company")', 'a with title'],
    ['<a id="donuts3">About us</a>', '<a id="donuts3">About us</a>', 'a with no src'],
    ['<a href="http://example.com/about"><span>About us</span></a>', '[<span>About us</span>](http://example.com/about)', 'with a span']
  ])
})

test('pre/code blocks', function () {
  runTestCases([
    [
      ['<pre><code>def hello_world',
        '  # 42 &lt; 9001',
        '  "Hello world!"',
        'end</code></pre>'].join('\n'),

      ['    def hello_world',
        '      # 42 < 9001',
        '      "Hello world!"',
        '    end'].join('\n')
    ],
    [
      ['<pre><code>def foo',
        '  # 42 &lt; 9001',
        "  'Hello world!'",
        'end</code></pre>',
        '<p>next:</p>',
        '<pre><code>def bar',
        '  # 42 &lt; 9001',
        "  'Hello world!'",
        'end</code></pre>'].join('\n'),

      ['    def foo',
        '      # 42 < 9001',
        "      'Hello world!'",
        '    end',
        '',
        'next:',
        '',
        '    def bar',
        '      # 42 < 9001',
        "      'Hello world!'",
        '    end'].join('\n'),

      'Multiple pre/code blocks'
    ],
    ['<pre>preformatted</pre>', '<pre>preformatted</pre>', 'Plain pre']
  ])
})

test('lists', function () {
  runTestCases([
    ['1986. What a great season.', '1986\\. What a great season.', 'ol triggers are escaped'],
    ['<ol>\n\t<li>Hello world</li>\n\t<li>Foo bar</li>\n</ol>', '1.  Hello world\n2.  Foo bar', 'ol'],
    ['<ul>\n\t<li>Hello world</li>\n\t<li>Foo bar</li>\n</ul>', '*   Hello world\n*   Foo bar', 'ul'],
    [
      ['<ul>',
        '  <li>Hello world</li>',
        '  <li>Lorem ipsum</li>',
        '</ul>',
        '<ul>',
        '  <li>Hello world</li>',
        '  <li>Lorem ipsum</li>',
        '</ul>'].join('\n'),

      ['*   Hello world',
        '*   Lorem ipsum',
        '',
        '*   Hello world',
        '*   Lorem ipsum'].join('\n'),

      'Multiple uls'
    ],
    [
      '<ul><li><p>Hello world</p></li><li>Lorem ipsum</li></ul>',
      '*   Hello world\n\n*   Lorem ipsum',
      'ul with p'
    ],
    [
      ['<ol>',
        '  <li>',
        '    <p>This is a list item with two paragraphs.</p>',
        '    <p>Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.</p>',
        '  </li>',
        '  <li>',
        '    <p>Suspendisse id sem consectetuer libero luctus adipiscing.</p>',
        '  </li>',
        '</ol>'].join('\n'),

      ['1.  This is a list item with two paragraphs.',
        '',
        '    Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.',
        '',
        '2.  Suspendisse id sem consectetuer libero luctus adipiscing.'].join('\n'),

      'ol with multiple ps'
    ],
    [
      ['<ul>',
        '  <li>This is a list item at root level</li>',
        '  <li>This is another item at root level</li>',
        '  <li>',
        '    <ul>',
        '      <li>This is a nested list item</li>',
        '      <li>This is another nested list item</li>',
        '      <li>',
        '        <ul>',
        '          <li>This is a deeply nested list item</li>',
        '          <li>This is another deeply nested list item</li>',
        '          <li>This is a third deeply nested list item</li>',
        '        </ul>',
        '      </li>',
        '    </ul>',
        '  </li>',
        '  <li>This is a third item at root level</li>',
        '</ul>'].join('\n'),

      ['*   This is a list item at root level',
        '*   This is another item at root level',
        '*   *   This is a nested list item',
        '    *   This is another nested list item',
        '    *   *   This is a deeply nested list item',
        '        *   This is another deeply nested list item',
        '        *   This is a third deeply nested list item',
        '*   This is a third item at root level'].join('\n'),

      'Nested uls'
    ],
    [
      ['<ul>',
        '  <li>This is a list item at root level</li>',
        '  <li>This is another item at root level</li>',
        '  <li>',
        '    <ol>',
        '      <li>This is a nested list item</li>',
        '      <li>This is another nested list item</li>',
        '      <li>',
        '        <ul>',
        '          <li>This is a deeply nested list item</li>',
        '          <li>This is another deeply nested list item</li>',
        '          <li>This is a third deeply nested list item</li>',
        '        </ul>',
        '      </li>',
        '    </ol>',
        '  </li>',
        '  <li>This is a third item at root level</li>',
        '</ul>'].join('\n'),

      ['*   This is a list item at root level',
        '*   This is another item at root level',
        '*   1.  This is a nested list item',
        '    2.  This is another nested list item',
        '    3.  *   This is a deeply nested list item',
        '        *   This is another deeply nested list item',
        '        *   This is a third deeply nested list item',
        '*   This is a third item at root level'].join('\n'),

      'Nested ols'
    ],
    [
      ['<ul>',
        '  <li>',
        '    <p>A list item with a blockquote:</p>',
        '    <blockquote>',
        '      <p>This is a blockquote inside a list item.</p>',
        '    </blockquote>',
        '  </li>',
        '</ul>'].join('\n'),

      ['*   A list item with a blockquote:',
        '',
        '    > This is a blockquote inside a list item.'].join('\n'),

      'ul with blockquote'
    ]
  ])
})

test('blockquotes', function () {
  runTestCases([
    [
      ['<blockquote>',
        '  <p>This is a blockquote with two paragraphs.</p>',
        '',
        '  <p>Donec sit amet nisl.</p>',
        '</blockquote>'].join('\n'),

      ['> This is a blockquote with two paragraphs.',
        '> ',
        '> Donec sit amet nisl.'].join('\n'),

      'blockquote with two ps'
    ],
    [
      ['<blockquote>',
        '  <p>This is the first level of quoting.</p>',
        '',
        '  <blockquote>',
        '    <p>This is nested blockquote.</p>',
        '  </blockquote>',
        '',
        '  <p>Back to the first level.</p>',
        '</blockquote>'].join('\n'),

      ['> This is the first level of quoting.',
        '> ',
        '> > This is nested blockquote.',
        '> ',
        '> Back to the first level.'].join('\n'),

      'Nested blockquotes'
    ],
    [
      ['<blockquote>',
        '  <h2>This is a header.</h2>',
        '  <ol>',
        '    <li>This is the first list item.</li>',
        '    <li>This is the second list item.</li>',
        '  </ol>',
        "  <p>Here's some example code:</p>",
        "  <pre><code>return 1 &lt; 2 ? shell_exec('echo $input | $markdown_script') : 0;</code></pre>",
        '</blockquote>'].join('\n'),

      ['> ## This is a header.',
        '> ',
        '> 1.  This is the first list item.',
        '> 2.  This is the second list item.',
        '> ',
        "> Here's some example code:",
        '> ',
        ">     return 1 < 2 ? shell_exec('echo $input | $markdown_script') : 0;"].join('\n'),

      'html in blockquote'
    ]
  ])
})

test('block-level', function () {
  runTestCases([
    ['<div>Hello</div><div>world</div>', '<div>Hello</div>\n\n<div>world</div>', 'divs separated by \\n\\n'],
    ['<div><em>hello</em></div>', '<div>_hello_</div>']
  ])
})

test('comments', function () {
  equal(toMarkdown('<!-- comment -->'), '', 'comments removed')
})

test('leading/trailing whitespace', function () {
  runTestCases([
    [
      '<p>I <a href="http://example.com">need</a> <a href="http://www.example.com">more</a> spaces!</p>',
      'I [need](http://example.com) [more](http://www.example.com) spaces!',
      'Whitespace between inline elements'
    ],
    ['<h1>\n    Header text', '# Header text', 'Leading whitespace in h1'],
    [
      ['<ol>',
        '  <li>Chapter One',
        '    <ol>',
        '      <li>Section One</li>',
        '      <li>Section Two </li>',
        '      <li>Section Three </li>',
        '    </ol>',
        '  </li>',
        '  <li>Chapter Two</li>',
        '  <li>Chapter Three  </li>',
        '</ol>'].join('\n'),

      ['1.  Chapter One',
        '    1.  Section One',
        '    2.  Section Two',
        '    3.  Section Three',
        '2.  Chapter Two',
        '3.  Chapter Three'].join('\n'),

      'Trailing whitespace in li'
    ],
    [
      ['<ul>',
        '  <li>', // Multilined
        '    Foo ',
        '  </li>',
        '  <li>', // Bizarre formatting
        '    <strong>Bar </strong> </li>',
        '  <li>Baz</li>',
        '</ul>',
        '<ol>',
        '  <li> Hello',
        '                      world',
        '  </li>',
        '</ol>'].join('\n'),

      ['*   Foo',
        '*   **Bar**',
        '*   Baz',
        '',
        '1.  Hello world'].join('\n')
    ],
    [
      'Hello world.<em> Foo </em><strong>bar </strong>',
      'Hello world. _Foo_ **bar**',
      'Whitespace in inline elements'
    ],
    [
      '<h1><img src="image.png"> Hello world.</h1>',
      '# ![](image.png) Hello world.',
      'Whitespace and void elements'
    ],
    [
      'Hello <strong><a href="https://www.google.com">Hello </a></strong>Hello',
      'Hello **[Hello](https://www.google.com)** Hello',
      'Whitespace in bold links.'
    ]
  ])
})

test('blank', function () {
  runTestCases([
    ['<div></div>', '', 'Blank div'],
    ['<em></em>', '', 'Blank em'],
    ['<strong><br></strong>', '', 'Blank strong with br'],
    ['<a href="#foo"></a>', '[](#foo)', 'Blank a']
  ])
})

test('custom converters', function () {
  var html
  var converter
  var md = '*Hello world*'
  var replacement = function (innerHTML) {
    return '*' + innerHTML + '*'
  }

  html = '<span>Hello world</span>'
  converter = {
    filter: 'span',
    replacement: replacement
  }
  equal(toMarkdown(html, {converters: [converter]}), md, 'Custom filter string')

  html = '<span>Hello world</span>'
  converter = {
    filter: ['span'],
    replacement: replacement
  }
  equal(toMarkdown(html, {converters: [converter]}), md, 'Custom filter array')

  html = '<span style="font-style: italic">Hello world</span>'
  converter = {
    filter: function (node) {
      return node.tagName === 'SPAN' && /italic/i.test(node.style.fontStyle)
    },
    replacement: replacement
  }
  equal(toMarkdown(html, {converters: [converter]}), md, 'Custom filter function')
})

test('invalid input', function () {
  throws(function () { toMarkdown(null) }, /null is not a string/, 'null input')
  throws(function () { toMarkdown(void (0)) }, /undefined is not a string/, 'undefined input')

  throws(function () { toMarkdown(null) }, function (e) {
    return e.name === 'TypeError'
  }, 'error type')
})

asyncTest('img[onerror]', 1, function () {
  start()
  equal(toMarkdown('>\'>"><img src=x onerror="(function () { ok(true); })()">'), '>\'>">![](x)', 'We expect img[onerror] functions not to run')
})

test('malformed documents', function () {
  expect(0) // just make sure to-markdown doesn't crash
  var html = '<HTML><head></head><BODY><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><body onload=alert(document.cookie);></body></html>'
  toMarkdown(html)
})

test('empty string', function () {
  runTestCases([
    ['', '']
  ])
})
