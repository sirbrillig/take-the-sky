/* @format */

import nearley from 'nearley';
import grammar from '../parser/grammar';
import getDialogTree from './dialog-tree';
import debugFactory from '../debug';
import { getNpcHappiness, getEvent } from '../selectors';

const debug = debugFactory('sky:dialog');

function executeComparison(comparator, leftSide, rightSide) {
	debug('comparing', leftSide, comparator, rightSide);
	if (rightSide === false && comparator === '=') {
		debug('evaluating left side as truthy/falsey', !leftSide);
		return !leftSide;
	}
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

function executeFunctionCall(state, handleAction, expression, finishScript) {
	switch (expression.functionName) {
		case 'getEvent': {
			const arg = executeExpression(state, handleAction, expression.args[0], finishScript); // eslint-disable-line no-use-before-define
			debug('getEvent', arg);
			return getEvent(state, arg);
		}
		case 'finish': {
			const arg = executeExpression(state, handleAction, expression.args[0], finishScript); // eslint-disable-line no-use-before-define
			debug('finish', arg);
			return finishScript(arg);
		}
		case 'getNpcHappiness': {
			const arg = executeExpression(state, handleAction, expression.args[0], finishScript); // eslint-disable-line no-use-before-define
			debug('getNpcHappiness', arg);
			return getNpcHappiness(state, arg);
		}
		case 'changeNpcHappiness': {
			const arg1 = executeExpression(state, handleAction, expression.args[0], finishScript); // eslint-disable-line no-use-before-define
			const arg2 = executeExpression(state, handleAction, expression.args[1], finishScript); // eslint-disable-line no-use-before-define
			debug('changeNpcHappiness', arg1, arg2);
			handleAction({
				type: 'NPC_HAPPINESS_CHANGE',
				payload: { npc: arg1, change: arg2 },
			});
			return true;
		}
		default:
			throw new Error(`Unknown function "${expression.functionName}"`);
	}
}

function executeExpression(state, handleAction, expression, finishScript) {
	switch (expression.type) {
		case 'bool':
			return expression.value;
		case 'number':
			return expression.value;
		case 'string':
			return expression.value;
		case 'functionCall':
			return executeFunctionCall(state, handleAction, expression, finishScript);
		default:
			throw new Error(`Unknown expression type "${expression.type}"`);
	}
}

function executeCondition(state, handleAction, { leftSide, rightSide, comparator }, finishScript) {
	return executeComparison(
		comparator.value,
		executeExpression(state, handleAction, leftSide, finishScript),
		executeExpression(state, handleAction, rightSide, finishScript)
	);
}

function executeStatements(state, handleAction, statements) {
	debug('statements', statements);
	let finishValue = false;
	const finishScript = value => {
		debug('changing finishValue', value);
		finishValue = value;
	};
	statements.forEach(statement => {
		switch (statement.type) {
			case 'if':
				debug('handling if statement');
				if (executeCondition(state, handleAction, statement.condition.value, finishScript)) {
					debug('if statement is true');
					finishScript(executeStatements(state, handleAction, statement.block.value));
				}
				debug('if statement is false');
				break;
			case 'functionCall':
				executeFunctionCall(state, handleAction, statement, finishScript);
				break;
			default:
				throw new Error(`Unknown statement type "${statement.type}"`);
		}
	});
	debug('finishValue is', finishValue);
	return finishValue;
}

export function executeScript(state, handleAction, script) {
	const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	debug('executing script');
	return executeStatements(state, handleAction, parser.feed(script).results);
}

export default function getDialogObjectForKey(key, state, handleAction) {
	const dialogObject = getDialogTree()[key];
	if (!dialogObject) {
		return { options: [], action: null, text: '' };
	}
	if (dialogObject.variants && dialogObject.variants.length) {
		const matchingVariant =
			dialogObject.variants.find(variant =>
				executeScript(state, handleAction, variant.condition)
			) || dialogObject.variants[0];
		return { options: [], action: null, text: '', ...matchingVariant };
	}
	return { options: [], action: null, text: '', ...dialogObject };
}
