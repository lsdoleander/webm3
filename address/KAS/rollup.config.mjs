
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

export default {
  input: 'index.js',
  output: {
    format: 'esm',
    file: '@dist.mjs'
  },
  plugins: [
    resolve({
      // modulePaths: [ '../../3rd/sha256/' ],

      browser: true,
      preferBuiltins: false
    }),

    commonjs(),
    polyfill(),
    json()
/*    replace({
      'Object.defineProperty(exports, "__esModule", { value: true });': ''
    })*/
    /*
    terser({
      compress: {
       // drop_console: true,
      },
      format: {
        comments: false
      }
    })*/
  ]
};