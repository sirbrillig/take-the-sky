/* @format */

import { getCurrentCoordinates } from './sprites';

export function setUpButtonControls(game, button, getControlMode, changePressingState) {
	const pressPilotKey = data => {
		if (getControlMode().mode === 'pilot') {
			changePressingState(data);
		}
	};
	button.press = () => pressPilotKey({ up: true });
	button.release = () => pressPilotKey({ up: false });
}

export function setUpKeyboardControls(
	game,
	getControlMode,
	changePressingState,
	changeControlMode
) {
	const upArrow = game.keyboard(38);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	const modeKey = game.keyboard(77);
	const pressPilotKey = data => {
		if (getControlMode().mode === 'pilot') {
			changePressingState(data);
		}
	};
	upArrow.press = () => pressPilotKey({ up: true });
	upArrow.release = () => pressPilotKey({ up: false });
	leftArrow.press = () => pressPilotKey({ left: true });
	leftArrow.release = () => pressPilotKey({ left: false });
	rightArrow.press = () => pressPilotKey({ right: true });
	rightArrow.release = () => pressPilotKey({ right: false });
	modeKey.press = () => changeControlMode({ mode: 'land' });
}

export function setUpNavigationRingControls(game, ring, getControlMode, changePressingState) {
	ring.interact = true;
	const pressPilotKey = data => {
		if (getControlMode().mode === 'pilot') {
			changePressingState(data);
		}
	};
	ring.press = () => pressPilotKey({ ring: getCurrentCoordinates(game) });
	ring.release = () => pressPilotKey({ ring: false });
}
