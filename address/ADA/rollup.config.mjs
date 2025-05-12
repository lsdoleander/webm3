
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'address.ts',
  output: {
    format: 'esm',
    file: '@dist.mjs',
  },
  plugins: [
    typescript({ compilerOptions: { module: 'CommonJS' } }),
    commonjs({ extensions: ['.js', '.ts'] }) 
  ]
};