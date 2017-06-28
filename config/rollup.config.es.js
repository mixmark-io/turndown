import config from './rollup.config'

export default config({
  format: 'es',
  dest: 'lib/turndown.es.js',
  browser: false
})
