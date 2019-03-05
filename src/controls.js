/* @format */

import { getCurrentCoordinates } from './sprites';
import getNextMode from './control-modes';

export function setUpButtonControls(
	game,
	button,
	getControlMode,
	changePressingState,
	getPressingState
) {
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState({ ...getPressingState(), ...data });
		}
	};
	button.press = () => pressPilotKey({ up: true });
	button.release = () => pressPilotKey({ up: false });
}

export function setUpKeyboardControls(
	game,
	getControlMode,
	changePressingState,
	changeControlMode,
	getPressingState
) {
	const upArrow = game.keyboard(38);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	const modeKey = game.keyboard(77); // 'm'
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState({ ...getPressingState(), ...data });
		}
	};
	upArrow.press = () => pressPilotKey({ up: true });
	upArrow.release = () => pressPilotKey({ up: false });
	leftArrow.press = () => pressPilotKey({ left: true });
	leftArrow.release = () => pressPilotKey({ left: false });
	rightArrow.press = () => pressPilotKey({ right: true });
	rightArrow.release = () => pressPilotKey({ right: false });
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
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState({ ...getPressingState(), ...data });
		}
	};
	ring.press = () => pressPilotKey({ ring: getCurrentCoordinates(game) });
	ring.release = () => pressPilotKey({ ring: false });
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
