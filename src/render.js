/* @format */

import { adjustSpeedForRotation, adjustNumberBetween } from './math';
import {
	getSpriteRotation,
	isShipTouchingStar,
	isShipTouchingPlanet,
	isShipTouchingGate,
	isChargeMeterFull,
	explodeShip,
} from './sprites';

function updateSystemPositionFromSpeed(state, actions) {
	const { getSpeed, getSystemPosition } = state;
	const { changeSystemPosition } = actions;
	const speed = getSpeed();
	const system = getSystemPosition();
	if (speed.x + speed.y !== 0) {
		changeSystemPosition({ x: system.x + speed.x, y: system.y + speed.y });
	}
}

function shouldIncreaseChargeMeter({ getPressingState, getControlMode }) {
	if (getPressingState().up && ['land', 'jump'].includes(getControlMode())) {
		return true;
	}
	return false;
}

/**
 * Update state based on other state
 *
 * This function, as opposed to moveSprites and setUpKeyboardControls, should
 * only update state based on other state.
 *
 * setUpKeyboardControls should update state based on input, and moveSprites
 * should update sprites based on state.
 */
export default function renderGame(game, sprites, state, actions, moveSprites) {
	const {
		getPressingState,
		getSpeed,
		getControlMode,
		getChargeMeterAmount,
		getHealthAmount,
		getEvent,
		isDialogVisible,
	} = state;
	const {
		changeSpeed,
		changeCurrentSystem,
		setChargeMeterAmount,
		setHealthAmount,
		showDialog,
	} = actions;
	const pressing = getPressingState();

	if (isDialogVisible()) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return;
	}

	if (getEvent('gameOver')) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return;
	}

	if (isShipTouchingStar(sprites) && !getEvent('starsAreHot')) {
		changeSpeed({ x: 0, y: 0 });
		showDialog('starsAreHot');
		return;
	}
	if (isShipTouchingStar(sprites) && getHealthAmount() > 0) {
		setHealthAmount(getHealthAmount() - 1);
	}

	if (getHealthAmount() < 1) {
		sprites.ship.visible = false;
		explodeShip(game);
		showDialog('explodedShip');
		return;
	}

	if (
		getControlMode() === 'land' &&
		isChargeMeterFull(getChargeMeterAmount()) &&
		isShipTouchingPlanet(sprites)
	) {
		setChargeMeterAmount(0);
		changeSpeed({ x: 0, y: 0 });
		showDialog('firstLanding1');
	}

	if (
		getControlMode() === 'jump' &&
		isChargeMeterFull(getChargeMeterAmount()) &&
		isShipTouchingGate(sprites)
	) {
		setChargeMeterAmount(0);
		if (getEvent('firstLanding')) {
			changeCurrentSystem('Betan');
		} else {
			showDialog('firstLandingNotDone');
		}
	}

	if (pressing.up && getControlMode() === 'pilot') {
		changeSpeed(adjustSpeedForRotation(getSpriteRotation(sprites.ship), getSpeed()));
	}

	setChargeMeterAmount(
		adjustNumberBetween(
			shouldIncreaseChargeMeter(state)
				? getChargeMeterAmount() + 1.0
				: getChargeMeterAmount() - 0.2,
			0,
			100
		)
	);

	updateSystemPositionFromSpeed(state, actions);

	moveSprites(sprites, state, actions);
}
