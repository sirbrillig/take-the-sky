/* @format */

import { getCurrentCoordinates } from './sprites';

export function setUpButtonControls(game, button, getControlMode, changePressingState) {
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState(data);
		}
	};
	button.press = () => pressPilotKey({ up: true });
	button.release = () => pressPilotKey({ up: false });
}

export function setUpKeyboardControls(game, getControlMode, changePressingState) {
	const upArrow = game.keyboard(38);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState(data);
		}
	};
	upArrow.press = () => pressPilotKey({ up: true });
	upArrow.release = () => pressPilotKey({ up: false });
	leftArrow.press = () => pressPilotKey({ left: true });
	leftArrow.release = () => pressPilotKey({ left: false });
	rightArrow.press = () => pressPilotKey({ right: true });
	rightArrow.release = () => pressPilotKey({ right: false });
}

export function setUpNavigationRingControls(game, ring, getControlMode, changePressingState) {
	ring.interact = true;
	const pressPilotKey = data => {
		if (getControlMode() === 'pilot') {
			changePressingState(data);
		}
	};
	ring.press = () => pressPilotKey({ ring: getCurrentCoordinates(game) });
	ring.release = () => pressPilotKey({ ring: false });
}
