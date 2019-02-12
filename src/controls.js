/* @format */

import { getCurrentCoordinates } from './sprites';

export function setUpButtonControls(game, button, changePressingState) {
	button.press = () => {
		changePressingState({ up: true });
	};
	button.release = () => {
		changePressingState({ up: false });
	};
}

export function setUpKeyboardControls(game, changePressingState) {
	const upArrow = game.keyboard(38);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	upArrow.press = () => {
		changePressingState({ up: true });
	};
	upArrow.release = () => {
		changePressingState({ up: false });
	};
	leftArrow.press = () => {
		changePressingState({ left: true });
	};
	leftArrow.release = () => {
		changePressingState({ left: false });
	};
	rightArrow.press = () => {
		changePressingState({ right: true });
	};
	rightArrow.release = () => {
		changePressingState({ right: false });
	};
}

export function setUpNavigationRingControls(game, ring, changePressingState) {
	ring.interact = true;
	ring.press = () => {
		changePressingState({ ring: getCurrentCoordinates(game) });
	};
	ring.release = () => {
		changePressingState({ ring: false });
	};
}
