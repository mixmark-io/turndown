if (typeof module !== 'undefined' && module.exports) {
  var toMarkdown = require('../index');
}

QUnit.module('GitHub Flavored Markdown');

test('strikethroughs', function() {
  equal(toMarkdown('<del>Lorem ipsum</del>'), '~~Lorem ipsum~~', 'del');
  equal(toMarkdown('<s>Lorem ipsum</s>'), '~~Lorem ipsum~~', 's');
  equal(toMarkdown('<strike>Lorem ipsum</strike>'), '~~Lorem ipsum~~', 'strike');
});

test('task lists', function() {
  equal(toMarkdown('<ul><li><input type=checkbox>Check Me!</li></ul>'), '*   [ ] Check Me!', 'Unchecked inputs');
  equal(toMarkdown('<ul><li><input type=checkbox checked>Checked!</li></ul>'), '*   [x] Checked!', 'Checked inputs');
});

test('tables', function() {
  var html = [
    '<table>',
    '  <thead>',
    '    <tr>',
    '      <th>Column 1</th>',
    '      <th>Column 2</th>',
    '    </tr>',
    '  </thead>',
    '  <tbody>',
    '    <tr>',
    '      <td>Row 1, Column 1</td>',
    '      <td>Row 1, Column 2</td>',
    '    </tr>',
    '    <tr>',
    '      <td>Row 2, Column 1</td>',
    '      <td>Row 2, Column 2</td>',
    '    </tr>',
    '  </tbody',
    '</table>'
  ].join('\n');

  md = [
    '| Column 1 | Column 2 |',
    '| --- | --- |',
    '| Row 1, Column 1 | Row 1, Column 2 |',
    '| Row 2, Column 1 | Row 2, Column 2 |'
  ].join('\n');

  equal(toMarkdown(html), md, 'Basic table');

  html = [
    '<table>',
    '  <thead>',
    '    <tr>',
    '      <th align="left">Column 1</th>',
    '      <th align="right">Column 2</th>',
    '    </tr>',
    '  </thead>',
    '  <tbody>',
    '    <tr>',
    '      <td>Row 1, Column 1</td>',
    '      <td>Row 1, Column 2</td>',
    '    </tr>',
    '    <tr>',
    '      <td>Row 2, Column 1</td>',
    '      <td>Row 2, Column 2</td>',
    '    </tr>',
    '  </tbody',
    '</table>'
  ].join('\n');

  md = [
    '| Column 1 | Column 2 |',
    '| :-- | --: |',
    '| Row 1, Column 1 | Row 1, Column 2 |',
    '| Row 2, Column 1 | Row 2, Column 2 |'
  ].join('\n');

  equal(toMarkdown(html), md, 'Cell alignment');
});


