/* @format */

import { adjustSpeedForRotation, clampNumber, clampRadians } from './math';
import { getEvent, getPlayerPosition, getHealthAmount } from './selectors';
import {
	isShipTouchingStar,
	getPlanetTouchingShip,
	isShipTouchingGate,
	isChargeMeterFull,
	explodeShip,
} from './sprites';

function updatePlayerPositionFromSpeed(state, actions) {
	const { getSpeed, getState } = state;
	const { changePlayerPosition } = actions;
	const speed = getSpeed();
	const playerPosition = getPlayerPosition(getState());
	if (speed.x + speed.y !== 0) {
		changePlayerPosition({ x: playerPosition.x + speed.x, y: playerPosition.y + speed.y });
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
		isDialogVisible,
		getState,
	} = state;
	const {
		changeSpeed,
		changeCurrentSystem,
		setChargeMeterAmount,
		showDialog,
		handleAction,
	} = actions;
	const pressing = getPressingState();

	if (isDialogVisible()) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return;
	}

	if (getEvent(getState(), 'gameOver')) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return;
	}

	if (isShipTouchingStar(sprites) && !getEvent(getState(), 'starsAreHot')) {
		changeSpeed({ x: 0, y: 0 });
		sprites.ship.rotation = clampRadians(sprites.ship.rotation + Math.PI);
		showDialog('starsAreHot');
		return;
	}
	if (isShipTouchingStar(sprites) && getHealthAmount(getState()) > 0) {
		handleAction({ type: 'HEALTH_CHANGE', payload: getHealthAmount(getState()) - 0.5 });
	}

	if (getHealthAmount(getState()) < 1) {
		explodeShip(game, sprites);
		showDialog('explodedShip');
		return;
	}

	const touchingPlanet = getPlanetTouchingShip(sprites);
	if (getControlMode() === 'land' && isChargeMeterFull(getChargeMeterAmount()) && touchingPlanet) {
		setChargeMeterAmount(0);
		changeSpeed({ x: 0, y: 0 });
		showDialog(`landingPlanet${touchingPlanet.planetData.name}`);
	}

	if (
		getControlMode() === 'jump' &&
		isChargeMeterFull(getChargeMeterAmount()) &&
		isShipTouchingGate(sprites)
	) {
		setChargeMeterAmount(0);
		if (getEvent(getState(), 'firstLanding')) {
			changeCurrentSystem('Betan');
		} else {
			showDialog('firstLandingNotDone');
		}
	}

	if (pressing.up && getControlMode() === 'pilot') {
		changeSpeed(adjustSpeedForRotation(sprites.ship.rotation, getSpeed()));
	}

	setChargeMeterAmount(
		clampNumber(
			shouldIncreaseChargeMeter(state)
				? getChargeMeterAmount() + 1.0
				: getChargeMeterAmount() - 0.2,
			0,
			100
		)
	);

	updatePlayerPositionFromSpeed(state, actions);

	moveSprites(sprites, state, actions);
}
