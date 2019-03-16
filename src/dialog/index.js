/* @format */

import nearley from 'nearley';
import grammar from '../parser/grammar';
import getDialogTree from './dialog-tree';

import { getNpcHappiness } from '../selectors';

function compare(comparator, leftSide, rightSide) {
	switch (comparator) {
		case '>':
			return leftSide > rightSide;
		case '<':
			return leftSide < rightSide;
		case '>=':
			return leftSide >= rightSide;
		case '<=':
			return leftSide <= rightSide;
		case '=':
			return leftSide == rightSide; // eslint-disable-line eqeqeq
		default:
			return false;
	}
}

function executeScript(state, script) {
	const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	parser.feed(script);
	return parser.results.find(statement => {
		switch (statement.command.value) {
			case 'getNpcHappiness': {
				const leftSide = getNpcHappiness(state, statement.key.value);
				const result = compare(statement.comparator.value, leftSide, statement.number.value);
				return result;
			}
			default:
				throw new Error(`Unknown command ${statement.command.value}`);
		}
	});
}

export default function getDialogObjectForKey(key, state) {
	const dialogObject = getDialogTree()[key];
	if (!dialogObject) {
		return { options: [], action: null, text: '' };
	}
	if (dialogObject.variants && dialogObject.variants.length) {
		const matchingVariant =
			dialogObject.variants.find(variant => executeScript(state, variant.condition)) ||
			dialogObject.variants[0];
		return { options: [], action: null, text: '', ...matchingVariant };
	}
	return { options: [], action: null, text: '', ...dialogObject };
}
