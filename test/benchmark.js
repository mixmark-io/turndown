const tinybench = require('tinybench')
const fs = require('fs')
const path = require('path')

var TurndownService = require('../lib/turndown.cjs')

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')

const bench = new tinybench.Bench({ time: 100 })

bench
	.add('domino', () => {
		process.env.PARSER = 'domino'
		const turndown = new TurndownService()
		turndown.turndown(html)
	})
	.add('happy-dom', () => {
		process.env.PARSER = 'happy-dom'
		const turndown = new TurndownService()
		turndown.turndown(html)
	})

bench.warmup().then(() => bench.run()
	.then(() => console.table(bench.table())))
