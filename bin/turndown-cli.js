#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var TurndownService = require('../lib/turndown.cjs.js')

function readStdin () {
  return fs.readFileSync(0, 'utf8')
}

function outputPathFor (inputPath) {
  var ext = path.extname(inputPath)
  var base = ext ? inputPath.slice(0, -ext.length) : inputPath
  return base + '.md'
}

function main () {
  var inputPath = process.argv[2]
  var turndownService = new TurndownService()

  var html = inputPath
    ? fs.readFileSync(path.resolve(process.cwd(), inputPath), 'utf8')
    : readStdin()

  var markdown = turndownService.turndown(html)

  if (inputPath) {
    var outputPath = path.resolve(process.cwd(), outputPathFor(inputPath))
    fs.writeFileSync(outputPath, markdown)
  } else {
    process.stdout.write(markdown)
  }
}

main()
