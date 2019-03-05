/* @format */

import { getCurrentCoordinates } from './sprites';
import getNextMode from './control-modes';

export function setUpButtonControls(game, button, changePressingState, getPressingState) {
	button.press = () => changePressingState({ ...getPressingState(), up: true });
	button.release = () => changePressingState({ ...getPressingState(), up: false });
}

export function setUpKeyboardControls(
	game,
	getControlMode,
	changePressingState,
	changeControlMode,
	getPressingState
) {
	// number is JS key code: https://keycode.info/
	const upArrow = game.keyboard(38);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	const modeKey = game.keyboard(77); // 'm'
	const spaceBar = game.keyboard(32);
	upArrow.press = () => changePressingState({ ...getPressingState(), up: true });
	upArrow.release = () => changePressingState({ ...getPressingState(), up: false });
	spaceBar.press = () => changePressingState({ ...getPressingState(), up: true });
	spaceBar.release = () => changePressingState({ ...getPressingState(), up: false });
	leftArrow.press = () => changePressingState({ ...getPressingState(), left: true });
	leftArrow.release = () => changePressingState({ ...getPressingState(), left: false });
	rightArrow.press = () => changePressingState({ ...getPressingState(), right: true });
	rightArrow.release = () => changePressingState({ ...getPressingState(), right: false });
	modeKey.press = () => changeControlMode(getNextMode(getControlMode()));
}

export function setUpNavigationRingControls(
	game,
	ring,
	getControlMode,
	changePressingState,
	getPressingState
) {
	ring.interact = true;
	ring.press = () =>
		changePressingState({ ...getPressingState(), ring: getCurrentCoordinates(game) });
	ring.release = () => changePressingState({ ...getPressingState(), ring: false });
}

export function getTurningDirectionFromPressingState(pressing) {
	if (pressing.left) {
		return 'left';
	}
	if (pressing.right) {
		return 'right';
	}
	return '';
}
