/* @format */

import nearley from 'nearley';
import grammar from '../parser/grammar';
import getDialogTree from './dialog-tree';
import debugFactory from '../debug';
import { getNpcHappiness, getEvent } from '../selectors';
import { makeShipData } from '../other-ships';

const debug = debugFactory('sky:dialog');

export default class Dialog {
	constructor({ getState, handleAction, ai = null }) {
		this.getState = getState;
		this.handleAction = handleAction;
		this.ai = ai;
	}

	// eslint-disable-next-line class-methods-use-this
	executeComparison(comparator, leftSide, rightSide) {
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

	executeFunctionCall(expression, finishScript) {
		switch (expression.functionName) {
			case 'getEvent': {
				const arg = this.executeExpression(expression.args[0], finishScript);
				debug('getEvent', arg);
				return getEvent(this.getState(), arg);
			}
			case 'finish': {
				const arg = this.executeExpression(expression.args[0], finishScript);
				debug('finish', arg);
				return finishScript(arg);
			}
			case 'getNpcHappiness': {
				const arg = this.executeExpression(expression.args[0], finishScript);
				debug('getNpcHappiness', arg);
				return getNpcHappiness(this.getState(), arg);
			}
			case 'changeNpcHappiness': {
				const arg1 = this.executeExpression(expression.args[0], finishScript);
				const arg2 = this.executeExpression(expression.args[1], finishScript);
				debug('changeNpcHappiness', arg1, arg2);
				this.handleAction({
					type: 'NPC_HAPPINESS_CHANGE',
					payload: { npc: arg1, change: arg2 },
				});
				return true;
			}
			case 'createShip': {
				const type = this.executeExpression(expression.args[0], finishScript);
				const name = this.executeExpression(expression.args[1], finishScript);
				const behavior = expression.args[2].value;
				const shipData = makeShipData(type, name, behavior);
				this.handleAction({ type: 'OTHER_SHIP_ADD', payload: shipData });
				return true;
			}
			case 'distanceToPlayer':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.distanceToPlayer();
			case 'isShipFacingPlayer':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.isShipFacingPlayer();
			case 'triggerEvent':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.triggerEvent(this.executeExpression(expression.args[0], finishScript));
			case 'linkToDialog':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.showDialog(this.executeExpression(expression.args[0], finishScript));
			case 'rotateTowardPlayer':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.rotateTowardPlayer();
			case 'accelerate':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.accelerate();
			case 'decelerate':
				if (!this.ai) {
					throw new Error('Cannot use AI functions without AI');
				}
				return this.ai.decelerate();
			default:
				throw new Error(`Unknown function "${expression.functionName}"`);
		}
	}

	executeExpression(expression, finishScript) {
		switch (expression.type) {
			case 'bool':
				return expression.value;
			case 'number':
				return expression.value;
			case 'string':
				return expression.value;
			case 'functionCall':
				return this.executeFunctionCall(expression, finishScript);
			default:
				throw new Error(`Unknown expression type "${expression.type}"`);
		}
	}

	executeCondition(condition, finishScript) {
		if (condition.type === 'comparison') {
			return this.executeComparison(
				condition.comparator.value,
				this.executeExpression(condition.leftSide, finishScript),
				this.executeExpression(condition.rightSide, finishScript)
			);
		}
		return !!this.executeExpression(condition, finishScript);
	}

	executeStatements(statements) {
		debug('statements', statements);
		let finishValue = false;
		const finishScript = value => {
			if (value === finishValue) {
				return;
			}
			debug('changing finishValue', value);
			finishValue = value;
		};
		statements.forEach(statement => {
			switch (statement.type) {
				case 'if':
					debug('handling if statement');
					if (
						statement.condition.isInverted &&
						!this.executeCondition(statement.condition.value, finishScript)
					) {
						debug('if statement is true (inverted)');
						finishScript(this.executeStatements(statement.block.value));
						break;
					}
					if (
						!statement.condition.isInverted &&
						this.executeCondition(statement.condition.value, finishScript)
					) {
						debug('if statement is true');
						finishScript(this.executeStatements(statement.block.value));
						break;
					}
					debug('if statement is false');
					break;
				case 'functionCall':
					this.executeFunctionCall(statement, finishScript);
					break;
				default:
					throw new Error(`Unknown statement type "${statement.type}"`);
			}
		});
		debug('finishValue is', finishValue);
		return finishValue;
	}

	executeScript(script) {
		const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
		debug('executing script');
		return this.executeStatements(parser.feed(script).results);
	}

	getDialogObjectForKey(key) {
		const dialogObject = getDialogTree()[key];
		if (!dialogObject) {
			return { options: [], action: null, text: '' };
		}
		if (dialogObject.variants && dialogObject.variants.length) {
			const matchingVariant =
				dialogObject.variants.find(variant => this.executeScript(variant.condition)) ||
				dialogObject.variants[0];
			return { options: [], action: null, text: '', ...matchingVariant };
		}
		return { options: [], action: null, text: '', ...dialogObject };
	}
}
