#!/usr/bin/env node
'use strict';

const fs = require('fs')
const path = require('path')
const program = require('commander')
const TurndownService = require('../')

program
    .version(require('../package.json').version)
    .usage('(<input> | --input [input]) [options]')
    .description(
        'Convert HTML into Markdown with JavaScript.\n\n' +
        'Where <input> is a string of HTML or a path to an HTML file.\n' +
        'options are hyphen-separated flags of the options listed below (e.g. headingStylebecomes --heading-style).\n' +
        'The CLI accepts input via stdin with the --input option.'
    )
    .option('-i, --input [input]', 'string of HTML or HTML file to convert. Read stdin if undefined.')
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
    .parse(process.argv);

if (program.input === true) {
  let stdin = ''
  process.stdin.on('readable', function () {
    let chunk = this.read()
    if (chunk !== null) stdin += chunk
  })
  process.stdin.on('end', function () {
    turndown(stdin)
  })
} else if (program.input) {
  turndown(program.input)
} else if (program.args.length !== 0) {
  turndown(program.args[0])
} else program.help()

function turndown (string) {
  let turndownService = new TurndownService(options())

  if (fs.existsSync(string)) {
    fs.readFile(string, 'utf8', function (error, contents) {
      if (error) throw error
      output(turndownService.turndown(contents))
    })
  } else output(turndownService.turndown(string))
}

function output (markdown) {
  if (program.output) {
    fs.writeFile(program.output, markdown, 'utf8', function (error) {
      if (error) throw error
      console.log(`output file: ${program.output}`)
    })
  } else console.log(markdown)
}

function options () {
  var opts = {}
  for (let i = 0; i < program.options.length; i++) {
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
