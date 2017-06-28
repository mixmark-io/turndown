import config from './rollup.config'

export default config({
  format: 'cjs',
  dest: 'lib/turndown.browser.cjs.js',
  browser: true
})
