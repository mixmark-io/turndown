#!/usr/bin/env node
var fs = require('fs')
var program = require('commander')
var TurndownService = require('../')

program
  .version(require('../package.json').version)
  .usage('(<input> | --input <input>) [options]')
  .option('-i, --input <input>', 'string of HTML or HTML file to convert')
  .option('-o, --output <file>', 'output file')
  .option('--bullet-list-marker <marker>', '"-", "+", or "*"')
  .option('--code-block-style <style>', '"indented" or "fenced"')
  .option('--em-delimiter <delimiter>', '"_" or "*"')
  .option('--fence <fence>', '"```" or "~~~"')
  .option('--heading-style <style>', '"setext" or "atx"')
  .option('--hr <hr>', 'any thematic break')
  .option('--link-style <style>', '"inlined" or "referenced"')
  .option('--link-reference-style <style>', '"full", "collapsed", or "shortcut"')
  .option('--strong-delimiter <delimiter>', '"**" or "__"')
  .parse(process.argv)

var stdin = ''
if (process.stdin.isTTY) {
  turndown(program.input || program.args[0])
} else {
  process.stdin.on('readable', function () {
    var chunk = this.read()
    if (chunk !== null) stdin += chunk
  })
  process.stdin.on('end', function () {
    turndown(stdin)
  })
}

function turndown (string) {
  var turndownService = new TurndownService(options())

  if (fs.existsSync(string)) {
    fs.readFile(string, 'utf8', function (error, contents) {
      if (error) throw error
      output(turndownService.turndown(contents))
    })
  } else {
    output(turndownService.turndown(string))
  }
}

function output (markdown) {
  if (program.output) {
    fs.writeFile(program.output, markdown, 'utf8', function (error) {
      if (error) throw error
      console.log(program.output)
    })
  } else {
    console.log(markdown)
  }
}

function options () {
  var opts = {}
  for (var i = 0; i < program.options.length; i++) {
    var optionName = optionNameFromFlag(program.options[i].long)
    if (program[optionName]) opts[optionName] = program[optionName]
  }
  delete opts.version
  delete opts.input
  delete opts.output
  return opts
}

function optionNameFromFlag (flag) {
  return flag.replace(/^--/, '').replace(/-([a-z])/g, function (match, char) {
    return char.toUpperCase()
  })
}
