import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'

export default function (config) {
  return {
    input: 'src/turndown.js',
    output: config.output,
    external: ['@mixmark-io/domino'],
    plugins: [
      commonjs(),
      replace({ 'process.browser': JSON.stringify(!!config.browser), preventAssignment: true }),
      resolve(),
      babel({
        babelHelpers: 'bundled',
        plugins: [
          '@babel/plugin-transform-block-scoping',
          '@babel/plugin-transform-shorthand-properties'
        ]
      })
    ]
  }
}
