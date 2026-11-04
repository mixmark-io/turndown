'use strict'

/*
 * Performance benchmark comparing the local build (lib/turndown.cjs.js) with a
 * baseline build and optionally with other builds. The default baseline is the
 * latest release, installed as the `turndown-baseline` dev dependency.
 * Not part of `npm test`.
 *
 *   npm run bench [-- options]
 *
 *   --baseline=<path>        baseline build: a turndown checkout or a .cjs.js file
 *   --compare=[<name>:]<path> another build to compare, can be repeated
 *   --file=<path>            add an HTML file as a case, can be repeated
 *   --filter=<regexp>        only run cases whose group or name matches
 *   --time=<ms>              minimum sampling time per case and build (default 1000)
 *   --dom                    pass a parsed DOM instead of an HTML string,
 *                            which leaves HTML parsing out of the timing
 *
 * Builds are given as paths to a checkout (its package.json "main" is used) or
 * to a built file. Each must be able to require @mixmark-io/domino.
 * To compare with a git ref instead of the release, e.g. master:
 *
 *   git worktree add ../turndown-master master
 *   (cd ../turndown-master && npm ci && npm run build-cjs)
 *   npm run bench -- --baseline=../turndown-master
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const { performance } = require('perf_hooks')

const MIN_SAMPLES = 5
const MIN_SAMPLE_TIME = 10 // ms, short operations are repeated within a sample

const args = parseArgs(process.argv.slice(2))
const minTime = Number(last(args.time) || 1000)
const filter = args.filter ? new RegExp(last(args.filter)) : null

const builds = [loadBuild('baseline', last(args.baseline) ? path.resolve(last(args.baseline)) : 'turndown-baseline')]
  .concat((args.compare || []).map(function (spec) {
    const match = /^(\w[\w.-]*):(.+)$/.exec(spec)
    return match ? loadBuild(match[1], path.resolve(match[2])) : loadBuild(path.basename(spec), path.resolve(spec))
  }))
  .concat([loadBuild('current', path.resolve(__dirname, '../lib/turndown.cjs.js'), 'local build')])

const cases = require('./cases').concat((args.file || []).map(function (file) {
  return { group: 'files', name: path.basename(file), description: path.relative(process.cwd(), file), html: fs.readFileSync(file, 'utf8') }
}))

console.log('node ' + process.version + ', ' + os.platform() + '/' + os.arch() + ', ' + os.cpus()[0].model)
console.log('input: ' + (args.dom ? 'parsed DOM (parsing excluded)' : 'HTML string (parsing included)'))
builds.forEach(function (build) { console.log(build.name + ': ' + build.label) })
console.log('times are medians per conversion; Nx = how many times faster than baseline\n')

const columns = [['case', 13], ['input', 9]]
  .concat(builds.map(function (build, i) { return [build.name, i ? 18 : 10] }))
  .concat([['output', 8], ['description', 0]])

let group = null
let differences = 0
cases.forEach(function (testCase) {
  if (filter && !filter.test(testCase.group + '/' + testCase.name)) return
  if (testCase.group !== group) {
    group = testCase.group
    console.log('\n[' + group + ']')
    printRow(columns.map(function (c) { return c[0] }))
  }

  const input = args.dom ? parse(testCase.html) : testCase.html
  const results = measure(builds.map(function (build) {
    const service = new build.TurndownService()
    return function () { return service.turndown(input) }
  }))

  const same = results.every(function (r) { return r.output === results[0].output })
  if (!same) differences++

  printRow([testCase.name, formatSize(testCase.html.length)]
    .concat(results.map(function (r, i) {
      return formatTime(r.median) + (i ? ' ' + (results[0].median / r.median).toFixed(2) + 'x' : '')
    }))
    .concat([same ? 'same' : 'DIFFERS', testCase.description]))
})

if (differences) {
  console.error('\n' + differences + ' case(s) produced different output, see the output column')
  process.exitCode = 1
}

/**
 * Runs the functions repeatedly, alternating between them sample by sample
 * and rotating their order every round, so that drift (GC pressure, CPU
 * throttling) and position affect all of them equally.
 * Returns the median time of one run (in ms) of each function along with the
 * output of its first (warm-up) run.
 */
function measure (fns) {
  const results = fns.map(function (fn) {
    const start = performance.now()
    const output = fn()
    const firstRun = performance.now() - start
    return {
      fn,
      output,
      runsPerSample: Math.max(1, Math.ceil(MIN_SAMPLE_TIME / Math.max(firstRun, 0.001))),
      samples: [],
      elapsed: 0
    }
  })

  const done = function (r) { return r.samples.length >= MIN_SAMPLES && r.elapsed >= minTime }
  for (let round = 0; !results.every(done); round++) {
    results.forEach(function (_, i) {
      const r = results[(i + round) % results.length]
      const start = performance.now()
      for (let i = 0; i < r.runsPerSample; i++) r.fn()
      const sampleTime = performance.now() - start
      r.elapsed += sampleTime
      r.samples.push(sampleTime / r.runsPerSample)
    })
  }

  return results.map(function (r) {
    r.samples.sort(function (a, b) { return a - b })
    return { output: r.output, median: r.samples[Math.floor(r.samples.length / 2)] }
  })
}

// modulePath is a package name, a package directory or a file
function loadBuild (name, modulePath, description) {
  const TurndownService = require(modulePath)
  const file = path.relative(process.cwd(), require.resolve(modulePath))
  if (!description) {
    try {
      const pkg = require(path.join(modulePath, 'package.json'))
      description = pkg.name + '@' + pkg.version
    } catch (e) {}
  }
  return { name, label: (description ? description + ' ' : '') + '(' + file + ')', TurndownService }
}

function parse (html) {
  const domino = require('@mixmark-io/domino')
  const doc = domino.createDocument('<x-turndown id="turndown-root">' + html + '</x-turndown>')
  return doc.getElementById('turndown-root')
}

// --name=value or --name, all values are collected in arrays
function parseArgs (argv) {
  const result = {}
  argv.forEach(function (arg) {
    const match = /^--([^=]+)(?:=(.*))?$/.exec(arg)
    if (!match) throw new Error('Unknown argument: ' + arg)
    result[match[1]] = (result[match[1]] || []).concat(match[2] === undefined ? [true] : [match[2]])
  })
  return result
}

function last (values) {
  return values && values[values.length - 1]
}

function formatTime (ms) {
  if (ms < 1) return (ms * 1000).toFixed(1) + ' µs'
  if (ms < 1000) return ms.toFixed(ms < 10 ? 2 : 1) + ' ms'
  return (ms / 1000).toFixed(2) + ' s'
}

function formatSize (chars) {
  if (chars < 1024) return chars + ' B'
  if (chars < 1024 * 1024) return (chars / 1024).toFixed(1) + ' KB'
  return (chars / 1024 / 1024).toFixed(1) + ' MB'
}

function printRow (cells) {
  console.log(cells.map(function (cell, i) { return String(cell).padEnd(columns[i][1]) }).join(' ').trimEnd())
}
