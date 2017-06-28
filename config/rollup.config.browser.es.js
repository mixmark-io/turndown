import config from './rollup.config'

export default config({
  format: 'es',
  dest: 'lib/turndown.browser.es.js',
  browser: true
})
