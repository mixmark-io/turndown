import replace from 'rollup-plugin-replace'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default function (config) {
  return {
    entry: 'src/turndown.js',
    format: config.format,
    moduleName: 'TurndownService',
    dest: config.dest,
    plugins: [
      replace({ 'process.browser': JSON.stringify(!!config.browser) }),
      nodeResolve({ skip: [ 'jsdom' ] }),
      commonjs()
    ]
  }
}
