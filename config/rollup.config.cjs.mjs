import config from './rollup.config.mjs'

export default config({
  output: {
    file: 'lib/turndown.cjs.js',
    format: 'cjs',
    exports: 'auto'
  },
  browser: false
})
