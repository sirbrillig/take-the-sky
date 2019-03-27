/* @format */

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: 'src/game.js',
	output: {
		file: 'public/dist/bundle.js',
		format: 'iife',
	},
	watch: {
		clearScreen: false,
	},
	plugins: [resolve(), commonjs()],
};
