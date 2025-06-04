
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.mjs',
  output: {
    format: 'esm',
    file: 'dist/esm/worker.mjs',
    globals: {
      lodash: '_',
    }
  },
  plugins: [
    commonjs(),
    resolve({
      preferBuiltins: true
    }),
    replace({
      __dirname: "import.meta.dirname",
      __filename: "import.meta.filename"
    }),
    json(),
  
    terser({
      compress: {
        //drop_console: true,
      },
      format: {
        comments: false
      }
    })
  ]
};