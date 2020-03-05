import config from './rollup.config'

export default config({
  output: {
    file: 'lib/turndown.browser.umd.js',
    format: 'umd',
    name: 'TurndownService'
  },
  browser: true
})
