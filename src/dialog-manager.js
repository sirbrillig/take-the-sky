/* @format */

import nearley from 'nearley';
import grammar from './parser/grammar';
import getDialogTree from './dialog-tree';
import {
	adjustSpeedForRotation,
	getRadiansNeededToRotateTowardPlayer,
	adjustRotationForDirection,
	getRotationDirection,
	preventBackwardsVelocity,
} from './math';
import debugFactory from './debug';
import { getNpcHappiness, getEvent } from './selectors';

const debug = debugFactory('sky:dialog');

export default class DialogManager {
	constructor({ getState, handleAction, currentMap, player, ship }) {
		this.getState = getState;
		this.handleAction = handleAction;
		this.currentMap = currentMap;
		this.player = player;
		this.ship = ship;
	}

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
			case 'not':
				debug('handling not function');
				return !this.executeCondition(expression.args[0], finishScript);
			case 'if':
				debug('handling if function');
				if (this.executeCondition(expression.args[0], finishScript)) {
					debug('if statement is true');
					// we call finishScript here to call it on the results of the new statements in the block
					finishScript(this.executeStatements(expression.args[1].value));
					return true;
				}
				debug('if statement is false');
				return false;
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
				debug('createShip', type, name, behavior);
				this.currentMap.createShip({ type, name, behavior });
				return true;
			}
			case 'distanceToPlayer':
				debug('distanceToPlayer');
				return this.player.physics.position.sub(this.ship.physics.position).magnitude();
			case 'isShipFacingPlayer':
				debug('isShipFacingPlayer');
				return (
					Math.abs(
						getRadiansNeededToRotateTowardPlayer({
							playerVector: this.player.physics.position,
							shipVector: this.ship.physics.position,
							rotation: this.ship.physics.rotation,
						})
					) < 0.1
				);
			case 'triggerEvent':
				debug('triggerEvent');
				this.handleAction({
					type: 'EVENT_TRIGGER',
					payload: this.executeExpression(expression.args[0], finishScript),
				});
				return true;
			case 'linkToDialog':
				debug('linkToDialog');
				this.handleAction({
					type: 'DIALOG_TRIGGER',
					payload: this.executeExpression(expression.args[0], finishScript),
				});
				return true;
			case 'fire':
				debug('fire');
				this.ship.fire();
				return true;
			case 'rotateTowardPlayer': {
				debug('rotateTowardPlayer');
				const radiansNeededToRotate = getRadiansNeededToRotateTowardPlayer({
					playerVector: this.player.physics.position,
					shipVector: this.ship.physics.position,
					rotation: this.ship.physics.rotation,
				});
				const radiansToRotate =
					Math.abs(radiansNeededToRotate) < this.ship.physics.rotationRate
						? radiansNeededToRotate
						: this.ship.physics.rotationRate;
				debug('radians to player', radiansNeededToRotate, 'radians to rotate', radiansToRotate);
				const minRotationRate = 0.01; // Helps prevent jitter
				if (radiansToRotate < minRotationRate) {
					return;
				}
				this.ship.physics.rotation = adjustRotationForDirection(
					this.ship.physics.rotation,
					getRotationDirection(radiansNeededToRotate),
					radiansToRotate
				);
				return true;
			}
			case 'accelerate':
				debug('accelerate');
				this.ship.physics.velocity = adjustSpeedForRotation(
					this.ship.physics.rotation,
					this.ship.physics.velocity,
					this.ship.physics.accelerationRate,
					this.ship.physics.maxVelocity
				);
				return true;
			case 'decelerate': {
				debug('decelerate');
				const drag = this.ship.physics.accelerationRate * 1.5;
				const newVelocity = adjustSpeedForRotation(
					this.ship.physics.rotation,
					this.ship.physics.velocity,
					0, // accelerationRate
					this.ship.physics.maxVelocity,
					drag
				);
				this.ship.physics.velocity = preventBackwardsVelocity(
					this.ship.physics.rotation,
					newVelocity
				);
				return true;
			}
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
