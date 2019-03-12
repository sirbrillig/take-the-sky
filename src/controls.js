/* @format */
/* globals window */

import { getCurrentCoordinates } from './sprites';
import getNextMode from './control-modes';

export function setUpKeyboardControls(
	game,
	getControlMode,
	changePressingState,
	changeControlMode,
	getPressingState
) {
	const onKeyDown = event => {
		// number is JS key code: https://keycode.info/
		// TODO: change these to use `key` property
		switch (event.keyCode) {
			case 38: // up
				return changePressingState({ ...getPressingState(), up: true });
			case 32: // space
				return changePressingState({ ...getPressingState(), up: true });
			case 37: // left
				return changePressingState({ ...getPressingState(), left: true });
			case 39: // right
				return changePressingState({ ...getPressingState(), right: true });
			case 77: // m
				return changeControlMode(getNextMode(getControlMode()));
			default:
				return '';
		}
	};
	const onKeyUp = event => {
		// number is JS key code: https://keycode.info/
		// TODO: change these to use `key` property
		switch (event.keyCode) {
			case 38: // up
				return changePressingState({ ...getPressingState(), up: false });
			case 32: // space
				return changePressingState({ ...getPressingState(), up: false });
			case 37: // left
				return changePressingState({ ...getPressingState(), left: false });
			case 39: // right
				return changePressingState({ ...getPressingState(), right: false });
			default:
				return '';
		}
	};
	window.document.addEventListener('keydown', onKeyDown);
	window.document.addEventListener('keyup', onKeyUp);
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
