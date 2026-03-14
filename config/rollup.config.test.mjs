import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'test/turndown-test.js',
  output: {
    file: 'test/turndown-test.browser.js',
    format: 'iife',
    name: 'TurndownTest'
  },
  plugins: [
    resolve({ browser: true }),
    commonjs({
      ignore: ['events', 'fs', 'path', 'stream']
    })
  ]
}
