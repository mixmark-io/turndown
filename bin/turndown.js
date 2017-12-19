#!/usr/bin/env node
var program = require('commander')
var TurndownService = require('../')

program
  .version(require('../package.json').version)
  .usage('<input> [options]')
  .option('--bullet-list-marker <marker]', '"-", "+", or "*"')
  .option('--code-block-style <style]', '"indented"" or "fenced"')
  .option('--em-delimiter <delimiter]', '"_" or "*"')
  .option('--fence <fence]', '"```" or "~~~"')
  .option('--heading-style <style]', '"setext" or "atx"')
  .option('--hr <hr]', 'Any thematic break')
  .option('--link-style <style]', '"inlined" or "referenced"')
  .option('--link-reference-style <style]', '"full", "collapsed", or "shortcut"')
  .option('--strong-delimiter <delimiter]', '"**" or "__"')
  .parse(process.argv)

var stdin = ''
if (process.stdin.isTTY) {
  turndown(program.args[0])
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
  console.log(turndownService.turndown(string))
}

function options () {
  var opts = {}
  for (var i = 0; i < program.options.length; i++) {
    var optionName = optionNameFromFlag(program.options[i].long)
    if (optionName !== 'version' && program[optionName]) {
      opts[optionName] = program[optionName]
    }
  }
  return opts
}

function optionNameFromFlag (flag) {
  return flag.replace(/^--/, '').replace(/-([a-z])/g, function (match, char) {
    return char.toUpperCase()
  })
}
