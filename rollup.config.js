/* @format */

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

export default {
	input: 'src/game.ts',
	output: {
		file: 'public/dist/bundle.js',
		format: 'iife',
	},
	watch: {
		clearScreen: false,
	},
	plugins: [typescript(), resolve(), commonjs()],
};
