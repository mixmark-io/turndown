'use strict'

// Deterministic synthetic inputs, in three groups:
//
// - typical:  what most users convert (snippets, short documents, articles).
//             A change must not make these slower.
// - reported: shapes from performance reports (large documents such as RFCs,
//             one element with very many children, see #536).
// - stress:   other large inputs, each stressing a different code path.

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam'
).split(' ')

function text (seed, count) {
  const words = []
  for (let i = 0; i < count; i++) words.push(WORDS[(seed * 7 + i * 3) % WORDS.length])
  return words.join(' ')
}

function times (count, fn) {
  let html = ''
  for (let i = 0; i < count; i++) html += fn(i)
  return html
}

// Roughly 1 KB of HTML using most of the CommonMark rules
function section (i) {
  return (
    '<h2>Section ' + i + '</h2>\n' +
    '<p>' + text(i, 30) + ' <a href="https://example.com/' + i + '">a link</a>, ' +
    '<em>emphasis</em>, <strong>strong</strong> and <code>code()</code>. ' +
    text(i + 1, 20) + '</p>\n' +
    '<ul><li>' + text(i, 5) + '</li><li>' + text(i + 2, 8) +
    '<ul><li>nested ' + text(i, 3) + '</li></ul></li><li>' + text(i + 3, 6) + '</li></ul>\n' +
    '<blockquote><p>' + text(i + 4, 15) + '</p></blockquote>\n' +
    '<pre><code class="language-js">function f' + i + ' () {\n  return ' + i + ' * 2\n}\n</code></pre>\n' +
    '<p>1. *star* _under_ [brackets] # hash - dash + plus `tick` ' + text(i + 5, 10) +
    '<br>second line</p>\n' +
    '<ol><li>' + text(i, 4) + '</li><li>' + text(i + 1, 4) + '</li></ol>\n' +
    '<hr>\n' +
    '<p><img src="https://example.com/' + i + '.png" alt="image ' + i + '"> ' + text(i + 6, 12) + '</p>\n'
  )
}

// Article wrapped the way web pages usually are
function article (sections) {
  return '<article><header><h1>Title</h1><p>By <a href="/me">someone</a></p></header>' +
    times(sections, function (i) { return '<section>' + section(i) + '</section>' }) +
    '</article>'
}

// Nested layout tables, as in typical HTML emails
function email (rows) {
  return '<table width="100%"><tr><td><table width="600" align="center">' +
    times(rows, function (i) {
      return '<tr><td style="padding:8px"><p><strong>' + text(i, 3) + '</strong></p>' +
        '<p>' + text(i + 1, 25) + ' <a href="https://example.com/' + i + '">Read more</a></p></td>' +
        '<td><img src="https://example.com/' + i + '.png" alt=""></td></tr>'
    }) +
    '</table></td></tr></table>'
}

function wide (children) {
  return '<div>' + times(children, function (i) { return '<p>' + text(i, 6) + '</p>' }) + '</div>'
}

function nested (depth) {
  return times(depth, function (i) { return '<div>' + text(i, 3) }) + '</div>'.repeat(depth)
}

module.exports = [
  { group: 'typical', name: 'tiny', description: 'one short paragraph', html: '<p>Hello <strong>world</strong>!</p>' },
  { group: 'typical', name: 'small', description: 'short document using all common rules', html: section(0) },
  { group: 'typical', name: 'email', description: 'layout tables, 20 rows', html: email(20) },
  { group: 'typical', name: 'article-10', description: 'web page article, 10 sections', html: article(10) },
  { group: 'typical', name: 'article-50', description: 'web page article, 50 sections', html: article(50) },

  { group: 'reported', name: 'flat-1000', description: '1000 sections, ~9k top-level blocks (RFC-like)', html: times(1000, section) },
  { group: 'reported', name: 'wide-1k', description: '<div> with 1,000 <p> children', html: wide(1000) },
  { group: 'reported', name: 'wide-4k', description: '<div> with 4,000 <p> children', html: wide(4000) },
  { group: 'reported', name: 'wide-16k', description: '<div> with 16,000 <p> children', html: wide(16000) },

  { group: 'stress', name: 'article-1000', description: 'web page article, 1000 sections', html: article(1000) },
  { group: 'stress', name: 'inline-16k', description: '<p> with 16,000 inline elements', html: '<p>' + times(16000, function (i) { return '<b>' + text(i, 1) + '</b> ' + text(i, 2) + ' ' }) + '</p>' },
  { group: 'stress', name: 'list-8k', description: '<ul> with 8,000 items', html: '<ul>' + times(8000, function (i) { return '<li>' + text(i, 5) + '</li>' }) + '</ul>' },
  { group: 'stress', name: 'email-2k', description: 'layout tables, 2,000 rows', html: email(2000) },
  { group: 'stress', name: 'deep-500', description: '500 nested <div> elements', html: nested(500) },
  { group: 'stress', name: 'pre-20k', description: 'code block with 20,000 lines', html: '<pre><code>' + times(20000, function (i) { return 'let x' + i + ' = ' + i + ' // ' + text(i, 4) + '\n' }) + '</code></pre>' },
  { group: 'stress', name: 'escape-2k', description: '2,000 paragraphs full of Markdown syntax', html: times(2000, function (i) { return '<p>1. *a* _b_ **c** [d](e) # f - g + h &gt; i `j` ~~k~~ ' + text(i, 4) + ' 2) _l_</p>' }) }
]
