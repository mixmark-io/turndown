#!/usr/bin/env node

var toMarkdown = require('../src/to-markdown').toMarkdown;

function main (input) {
  console.log(toMarkdown(input));
}

var input = process.argv.slice(2).join(' ');

if (input) {
  main(input);
} else {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(chunk) {
    input += chunk;
  });

  process.stdin.on('end', function() {
    main(input);
  });
}