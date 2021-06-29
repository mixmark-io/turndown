import config from './rollup.config'

export default config({
  output: {
    file: 'lib/turndown.browser.cjs.js',
    format: 'cjs',
    exports: 'auto'
  },
  browser: true
})
