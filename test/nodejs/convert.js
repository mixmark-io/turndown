var toMarkdown = require(__dirname + '/../../src/to-markdown').toMarkdown;

exports['converting p elements'] = function(test) {
  test.equal(toMarkdown("<p>Lorem ipsum</p>"), "Lorem ipsum", "We expect p tags to be wrapped with two line breaks");
  test.equal(toMarkdown("<p class='intro'>Lorem ipsum</p>"), "Lorem ipsum", "We expect p tags to be wrapped with two line breaks");

  test.done();
};

exports['converting emphasis elements'] = function(test) {
  test.equal(toMarkdown("<b>Hello world</b>"), "**Hello world**", "We expect <b>Hello world</b> to be converted to **Hello world**");
  test.equal(toMarkdown("<strong>Hello world</strong>"), "**Hello world**", "We expect <strong>Hello world</strong> to be converted to **Hello world**");
  test.equal(toMarkdown("<b></b>"), "", "We expect b tags to be removed");
    
  test.equal(toMarkdown("<i>Hello world</i>"), "_Hello world_", "We expect <i>Hello world</i> to be converted to _Hello world_");
  test.equal(toMarkdown("<em>Hello world</em>"), "_Hello world_", "We expect <em>Hello world</em> to be converted to _Hello world_");
  test.equal(toMarkdown("<em id='one' class='cowabunga'>Hello world</em>"), "_Hello world_", "We expect <em id='one' class='cowabunga'>Hello world</em> to be converted to _Hello world_");
  test.equal(toMarkdown("<em id='one' class='cowabunga'></em>"), "", "We expect empty em tags to be removed");

  test.done();
};

exports['converting inline code elements'] = function(test) {
  test.equal(toMarkdown("<code>print()</code>"), "`print()`", "We expect inline code tags to be converted to backticks");
  test.equal(toMarkdown("<code></code>"), "", "We expect empty code tags to be removed");

  test.done();
};

exports['converting heading elements'] = function(test) {
  test.equal(toMarkdown("<h1>Hello world</h1>"), "# Hello world", "We expect <h1>Hello world</h1> to be converted to # Hello world");
  test.equal(toMarkdown("<h3>Hello world</h3>"), "### Hello world", "We expect <h3>Hello world</h3> to be converted to ### Hello world");
  test.equal(toMarkdown("<h6>Hello world</h6>"), "###### Hello world", "We expect <h6>Hello world</h6> to be converted to ###### Hello world");
    
  test.equal(toMarkdown("<h8>Hello world</h8>"), "<h8>Hello world</h8>", "We expect <h8>Hello world</h8> to be converted to <h8>Hello world</h8>");

  test.done();
};

exports['converting hr elements'] = function(test) {
  test.equal(toMarkdown("<hr />"), "* * *", "We expect hr elements to be converted to * * *");
  test.equal(toMarkdown("<hr/>"), "* * *", "We expect hr elements to be converted to * * *");
  test.equal(toMarkdown("<hr>"), "* * *", "We expect hr elements to be converted to * * *");
  test.equal(toMarkdown("<hr class='fancy' />"), "* * *", "We expect hr elements to be converted to * * *");

  test.done();
};

exports['converting img elements'] = function(test) {
  test.equal(toMarkdown("<img src='http://example.com/logo.png' />"), "![](http://example.com/logo.png)", "We expect img elements to be converted properly");
  test.equal(toMarkdown('<img src="http://example.com/logo.png" />'), "![](http://example.com/logo.png)", "We expect img elements to be converted properly");
  test.equal(toMarkdown("<img src='http://example.com/logo.png'>"), "![](http://example.com/logo.png)", "We expect img elements to be converted properly");
  test.equal(toMarkdown("<img src=http://example.com/logo.png>"), "![](http://example.com/logo.png)", "We expect img elements to be converted properly");
  test.equal(toMarkdown("<img src='http://example.com/logo.png' alt='Example logo' />"), "![Example logo](http://example.com/logo.png)", "We expect img elements to be converted properly with alt attrs");
  test.equal(toMarkdown("<img src='http://example.com/logo.png' alt='Example logo' title='Example title' />"), "![Example logo](http://example.com/logo.png \"Example title\")", "We expect img elements to be converted properly with alt and title attrs");

  test.done();
};

exports['converting anchor elements'] = function(test) {
  test.equal(toMarkdown("<a href='http://example.com/about'>About us</a>"), "[About us](http://example.com/about)", "We expect anchor elements to be converted properly");
  test.equal(toMarkdown('<a href="http://www.example.com/about" title="About this company">About us</a>'), '[About us](http://www.example.com/about "About this company")', "We expect an anchor element with a title tag to have correct markdown");
  test.equal(toMarkdown('<a class="some really messy stuff" href="/about" id="donuts3" title="About this company">About us</a>'), '[About us](/about "About this company")', "We expect an anchor element with a title tag to have correct markdown");
  test.equal(toMarkdown('<a id="donuts3">About us</a>'), '<a id="donuts3">About us</a>', "Anchor tags without an href should not be converted");

  test.done();
};

exports['converting code blocks'] = function(test) {
  var codeHtml = [
    "<pre><code>def hello_world",
    "  'Hello world!'",
    "end</code></pre>"
  ],
  codeMd = [
    "    def hello_world",
    "      'Hello world!'",
    "    end"
  ];
  test.equal(toMarkdown(codeHtml.join('\n')), codeMd.join('\n'), "We expect code blocks to be converted");

  test.done();
};

exports['converting list elements'] = function(test) {
  test.equal(toMarkdown("<ol>\n\t<li>Hello world</li>\n\t<li>Lorem ipsum</li>\n</ol>"), "1.  Hello world\n2.  Lorem ipsum", "We expect ol elements to be converted properly");
  test.equal(toMarkdown("<ul>\n\t<li>Hello world</li>\n\t<li>Lorem ipsum</li>\n</ul>"), "*   Hello world\n*   Lorem ipsum", "We expect ul elements with line breaks and tabs to be converted properly");
  test.equal(toMarkdown("<ul class='blargh'><li class='first'>Hello world</li><li>Lorem ipsum</li></ul>"), "*   Hello world\n*   Lorem ipsum", "We expect ul elements with attributes to be converted properly");
  test.equal(toMarkdown("<ul><li>Hello world</li><li>Lorem ipsum</li></ul><ul><li>Hello world</li><li>Lorem ipsum</li></ul>"), "*   Hello world\n*   Lorem ipsum\n\n*   Hello world\n*   Lorem ipsum", "We expect multiple ul elements to be converted properly");
  test.equal(toMarkdown("<ul><li><p>Hello world</p></li><li>Lorem ipsum</li></ul>"), "*   Hello world\n\n*   Lorem ipsum", "We expect li elements with ps to be converted properly");

  var numsToTriggerOlHtml = [
    "1986. What a great season.",
    "Dont apply to links that end in numbers <a href='http://mygreatsite/users/55'>Like This</a> and have spaces after them",
    "Or like an address 123. or anything",
    "<pre><code>1234. Four spaces make a code block</code></pre>"
  ].join('\n'),

  numsToTriggerOlMd = [
    "1986\\. What a great season.",
    "Dont apply to links that end in numbers [Like This](http://mygreatsite/users/55) and have spaces after them",
    "Or like an address 123. or anything",
    "",
    "    1234. Four spaces make a code block"
  ].join('\n');

  test.equal(toMarkdown(numsToTriggerOlHtml), numsToTriggerOlMd, 'We expect only the numbers that could trigger an ol to be escaped');
    
  var lisWithPsHtml = [
    "<ol>",
    "  <li>",
    "    <p>This is a list item with two paragraphs. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.</p>",
    "    <p>Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus. Donec sit amet nisl. Aliquam semper ipsum sit amet velit.</p>",
    "  </li>",
    "  <li>",
    "    <p>Suspendisse id sem consectetuer libero luctus adipiscing.</p>",
    "  </li>",
    "</ol>"
  ].join('\n'),
  
  lisWithPsMd = [
    "1.  This is a list item with two paragraphs. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.",
    "",
    "    Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus. Donec sit amet nisl. Aliquam semper ipsum sit amet velit.",
    "",
    "2.  Suspendisse id sem consectetuer libero luctus adipiscing."
  ].join('\n');
  
  test.equal(toMarkdown(lisWithPsHtml), lisWithPsMd,'We expect lists with paragraphs to be converted');
  
  var nestedListHtml = [
    "<ul>",
    "  <li>This is a list item at root level</li>",
    "  <li>This is another item at root level</li>",
    "  <li>",
    "    <ul>",
    "      <li>This is a nested list item</li>",
    "      <li>This is another nested list item</li>",
    "      <li>",
    "        <ul>",
    "          <li>This is a deeply nested list item</li>",
    "          <li>This is another deeply nested list item</li>",
    "          <li>This is a third deeply nested list item</li>",
    "        </ul>",
    "      </li>",
    "    </ul>",
    "  </li>",
    "  <li>This is a third item at root level</li>",
    "</ul>"
  ].join('\n'),
  nestedListMd = [
    "*   This is a list item at root level",
    "*   This is another item at root level",
    "*   *   This is a nested list item",
    "    *   This is another nested list item",
    "    *   *   This is a deeply nested list item",
    "        *   This is another deeply nested list item",
    "        *   This is a third deeply nested list item",
    "*   This is a third item at root level"
  ].join('\n');
  test.equal(toMarkdown(nestedListHtml), nestedListMd, "We expect nested lists to be converted properly");
  
  nestedListHtml = [
    "<ul>",
    "  <li>This is a list item at root level</li>",
    "  <li>This is another item at root level</li>",
    "  <li>",
    "    <ol>",
    "      <li>This is a nested list item</li>",
    "      <li>This is another nested list item</li>",
    "      <li>",
    "        <ul>",
    "          <li>This is a deeply nested list item</li>",
    "          <li>This is another deeply nested list item</li>",
    "          <li>This is a third deeply nested list item</li>",
    "        </ul>",
    "      </li>",
    "    </ol>",
    "  </li>",
    "  <li>This is a third item at root level</li>",
    "</ul>"
  ].join('\n');
  nestedListMd = [
    "*   This is a list item at root level",
    "*   This is another item at root level",
    "*   1.  This is a nested list item",
    "    2.  This is another nested list item",
    "    3.  *   This is a deeply nested list item",
    "        *   This is another deeply nested list item",
    "        *   This is a third deeply nested list item",
    "*   This is a third item at root level"
  ].join('\n');
  test.equal(toMarkdown(nestedListHtml), nestedListMd, "We expect nested lists to be converted properly");
  
  var html = [
    "<ul>",
    "  <li>",
    "    <p>A list item with a blockquote:</p>",
    "    <blockquote>",
    "      <p>This is a blockquote inside a list item.</p>",
    "    </blockquote>",
    "  </li>",
    "</ul>"
  ].join('\n');
  var md = [
    "*   A list item with a blockquote:",
    "",
    "    > This is a blockquote inside a list item."
  ].join('\n');
  
  // needs fixing: see https://github.com/domchristie/to-markdown/issues/2
  test.equal(toMarkdown(html), md, "We expect lists with blockquotes to be converted");

  test.done();
};

exports['converting blockquotes'] = function(test) {
  var html = [
    "<blockquote>",
    "  <p>This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.</p>",
    "",
    "  <p>Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse id sem consectetuer libero luctus adipiscing.</p>",
    "</blockquote>"
  ].join('\n');
  var md = [
    "> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.",
    "> ",
    "> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse id sem consectetuer libero luctus adipiscing."
  ].join('\n');
  test.equal(toMarkdown(html), md, "We expect blockquotes with two paragraphs to be converted");
  
  html = [
    "<blockquote>",
    "  <p>This is the first level of quoting.</p>",
    "",
    "  <blockquote>",
    "    <p>This is nested blockquote.</p>",
    "  </blockquote>",
    "",
    "  <p>Back to the first level.</p>",
    "</blockquote>"
  ].join('\n');
  md = [
    "> This is the first level of quoting.",
    "> ",
    "> > This is nested blockquote.",
    "> ",
    "> Back to the first level."
  ].join('\n');
  test.equal(toMarkdown(html), md, "We expect nested blockquotes to be converted");
  
  html = [
    "<blockquote>",
    "  <h2>This is a header.</h2>",
    "  <ol>",
    "    <li>This is the first list item.</li>",
    "    <li>This is the second list item.</li>",
    "  </ol>",
    "  <p>Here's some example code:</p>",
    "  <pre><code>return shell_exec(\"echo $input | $markdown_script\");</code></pre>",
    "</blockquote>"
  ].join('\n');
  md = [
    "> ## This is a header.",
    "> ",
    "> 1.  This is the first list item.",
    "> 2.  This is the second list item.",
    "> ",
    "> Here's some example code:",
    "> ",
    ">     return shell_exec(\"echo $input | $markdown_script\");"
  ].join('\n');
  test.equal(toMarkdown(html), md, "We expect html in blockquotes to be converted");
  
  test.done();
};
