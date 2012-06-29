/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011-2012, Dom Christie
 * Licenced under the MIT licence
 *
 */

var toMarkdown = function(input) {
    
  // Escape potential ol triggers
  // see bottom of lists section: http://daringfireball.net/projects/markdown/syntax#list
  input = input.replace(/(\d+)\. /g, '$1\\. ');
  
  // Wrap in containing div
  var $container = $('<div/>');
  input = $container.html(input);
  
  // Remove whitespace
  input.find('*:not(pre, code)').contents().filter(function() {
    return this.nodeType === 3 && (/^\s+|\s+$/.test(this.nodeValue));
  }).remove();
  
  var ELEMENTS = [
    {
      selector: 'p',
      replacement: function(innerHTML, el) {
        return innerHTML ? '\n\n' + innerHTML + '\n\n' : '';
      }
    },
    {
      selector: 'br',
      replacement: function(innerHTML, el) {
        return '\n';
      }
    },
    {
      selector: 'h1,h2,h3,h4,h5,h6',
      replacement: function(innerHTML, $el) {
        var hLevel = $el.prop("nodeName").charAt(1),
            prefix = '';
        for(var i = 0; i < hLevel; i++) {
          prefix += '#';
        }
        return innerHTML ? '\n\n' + prefix + ' ' + innerHTML + '\n\n' : '';
      }
    },
    {
      selector: 'hr',
      replacement: function(innerHTML, el) {
        return '\n\n* * *\n\n';
      }
    },
    {
      selector: 'a[href]',
      replacement: function(innerHTML, $el) {
        if(innerHTML) {
          var href = $el.attr('href'),
              title = $el.attr('title') || '';
          return '[' + innerHTML + ']' + '(' + href + (title ? ' "' + title + '"' : '') + ')';
        }
        else {
          return false;
        }
      }
    },
    {
      selector: 'b',
      replacement: strongReplacement
    },
    {
      selector: 'strong',
      replacement: strongReplacement
    },
    {
      selector: 'i',
      replacement: emReplacement
    },
    {
      selector: 'em',
      replacement: emReplacement
    },
    {
      selector: 'code',
      replacement: function(innerHTML, el) {
        return innerHTML ? '`' + innerHTML + '`' : '';
      }
    },
    {
      selector: 'img',
      replacement: function(innerHTML, $el) {
        var alt = $el.attr('alt') || '',
            src = $el.attr('src') || '',
            title = $el.attr('title') || '';
        return '![' + alt + ']' + '(' + src + (title ? ' "' + title + '"' : '') + ')';
      }
    },
    {
      selector: 'pre',
      replacement: function(innerHTML, el) {
        if(/^\s*\`/.test(innerHTML)) {
          innerHTML = innerHTML.replace(/\`/g, '');
          return '    ' + innerHTML.replace(/\n/g, '\n    ');
        }
        else {
          return '';
        }
      }
    },
    {
      selector: 'li',
      replacement: function(innerHTML, $el) {
        innerHTML = innerHTML.replace(/^\s+|\s+$/, '').replace(/\n/gm, '\n    ');
        var prefix = '*   ';
        var suffix = '';
        var $parent = $el.parent();
        var $children = $parent.contents().filter(function() {
          return (this.nodeType === 1 && this.nodeName === 'LI') || (this.nodeType === 3);
        });
        var index = $children.index($el) + 1;
        
        prefix = $parent.is('ol') ? index + '.  ' : '*   ';
        if(index == $children.length) {
          if(!$el.parents('li').length) {
            suffix = '\n';
          }
          innerHTML = innerHTML.replace(/\s+$/, ''); // Trim
          $el.unwrap();
        }
        return prefix + innerHTML + suffix + '\n';
      }
    },
    {
      selector: 'blockquote',
      replacement: function(innerHTML, el) {
        innerHTML = innerHTML.replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n');
        innerHTML = innerHTML.replace(/\n/g, '\n&gt; ');
        return "&gt; " + innerHTML;
      }
    }
  ];
  
  var NON_MD_BLOCK_ELEMENTS = ['address', 'article', 'aside', 'audio', 'canvas', 'div', 'dl', 'dd', 'dt',
    'fieldset', 'figcaption', 'figure', 'footer', 'form', 'header', 'hgroup', 'output',
    'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'section', 'video'];
  
  var selectors = [];
  for(var i = 0, len = ELEMENTS.length; i < len; i++) {
    selectors.push(ELEMENTS[i].selector);
  }
  selectors = selectors.join(',');
  
  function strongReplacement(innerHTML) {
    return innerHTML ? '**' + innerHTML + '**' : '';
  }
  function emReplacement(innerHTML) {
    return innerHTML ? '_' + innerHTML + '_' : '';
  }
  
  while(input.find(selectors).length) {
    for(var i = 0, len = ELEMENTS.length; i < len; i++) {
      
      // Find the innermost elements containing NO children that convert to markdown
      $matches = input.find(ELEMENTS[i].selector + ':not(:has("' + selectors + '"))');
  
      $matches.each(function(j, el) {
        var $el = $(el);
        $el.replaceWith(ELEMENTS[i].replacement($el.html(), $el));
      });
    }
  }
  
  // TODO: add line breaks to non-block-level 
  // input.find(NON_MD_BLOCK_ELEMENTS.join(',')).before('\n\n').after('\n\n');
  
  function cleanUp(string) {
    string = string.replace(/^[\t\r\n]+|[\t\r\n]+$/g, ''); // trim leading/trailing whitespace
    string = string.replace(/\n\s+\n/g, '\n\n');
    string = string.replace(/\n{3,}/g, '\n\n'); // limit consecutive linebreaks to 2
    string = string.replace(/&gt;/g, '>');  
    return string;
  }
  
  return cleanUp(input.html());
};

if (typeof exports === 'object') {
  exports.toMarkdown = toMarkdown;
}
