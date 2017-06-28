import config from './rollup.config'

export default config({
  format: 'cjs',
  dest: 'lib/turndown.cjs.js',
  browser: false
})
