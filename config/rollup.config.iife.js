import config from './rollup.config'

export default config({
  format: 'iife',
  dest: 'dist/turndown.js',
  browser: true
})
