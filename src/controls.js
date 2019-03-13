/* @format */
/* globals window */

import { getCurrentCoordinates } from './sprites';
import getNextMode from './control-modes';
import { getDialogObjectForKey } from './dialog-tree';

export function setUpKeyboardControls(game, state, actions) {
	const {
		getControlMode,
		getPressingState,
		isDialogVisible,
		getDialogSelection,
		getDialog,
	} = state;
	const { changePressingState, changeControlMode, dialogSelect, changeDialogSelection } = actions;
	const onKeyDown = event => {
		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				if (isDialogVisible() && getDialogSelection() > 0) {
					changeDialogSelection(getDialogSelection() - 1);
				}
				return changePressingState({ ...getPressingState(), up: true });
			case 'ArrowDown':
			case 'KeyS':
				if (
					isDialogVisible() &&
					getDialogSelection() < getDialogObjectForKey(getDialog()).options.length - 1
				) {
					changeDialogSelection(getDialogSelection() + 1);
				}
				return '';
			case 'Space':
			case 'Enter':
				if (!event.repeat) {
					dialogSelect();
				}
				return '';
			case 'ArrowLeft':
			case 'KeyA':
				return changePressingState({ ...getPressingState(), left: true });
			case 'ArrowRight':
			case 'KeyD':
				return changePressingState({ ...getPressingState(), right: true });
			case 'KeyM':
				return changeControlMode(getNextMode(getControlMode()));
			default:
				return '';
		}
	};
	const onKeyUp = event => {
		switch (event.code) {
			case 'ArrowUp':
			case 'Space':
			case 'KeyW':
				return changePressingState({ ...getPressingState(), up: false });
			case 'ArrowLeft':
			case 'KeyA':
				return changePressingState({ ...getPressingState(), left: false });
			case 'ArrowRight':
			case 'KeyD':
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
