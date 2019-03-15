/* @format */
/* globals window */

import getNextMode from './control-modes';
import { getDialogObjectForKey } from './dialog-tree';

export function setUpKeyboardControls(game, state, actions) {
	const {
		getControlMode,
		getPressingState,
		isDialogVisible,
		getDialogSelection,
		getDialogKey,
		getState,
	} = state;
	const { changePressingState, changeControlMode, showDialog, changeDialogSelection } = actions;
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
					getDialogSelection() <
						getDialogObjectForKey(getDialogKey(), getState()).options.length - 1
				) {
					changeDialogSelection(getDialogSelection() + 1);
				}
				return '';
			case 'Space':
			case 'Enter':
				if (!event.repeat && isDialogVisible()) {
					const dialogObject = getDialogObjectForKey(getDialogKey(), getState());
					if (dialogObject.options[getDialogSelection()]) {
						showDialog(dialogObject.options[getDialogSelection()].link || null);
						changeDialogSelection(0);
					}
				}
				return changePressingState({ ...getPressingState(), up: true });
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

export function getTurningDirectionFromPressingState(pressing) {
	if (pressing.left) {
		return 'left';
	}
	if (pressing.right) {
		return 'right';
	}
	return '';
}
