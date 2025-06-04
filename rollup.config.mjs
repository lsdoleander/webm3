
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';
import json from '@rollup/plugin-json';

export default {
  input: 'gen/browser/index.js',
  output: {
    format: 'iife',
    file: 'gen/browser/worker.js',
    globals: {
      lodash: '_',
    }
  },
  plugins: [
    commonjs(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    polyfill(),
    json(),
    
    terser({
      compress: {
       // drop_console: true,
      },
      format: {
        comments: false
      }
    })
  ]
};