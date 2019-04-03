/* @format */

import { clampNumber } from './math';
import DialogManager from './dialog-manager';
import { gameWidth, gameHeight } from './constants';
import debugFactory from './debug';

const debug = debugFactory('sky:game');

class GameState {
	constructor(stateName) {
		this.stateName = stateName;
	}

	handleInput() {}

	update() {}
}

export class FlyingState extends GameState {
	constructor() {
		super('flying');
	}

	update({ eventState, player, background, gameInterface, currentMap }) {
		if (eventState.getDialog()) {
			debug('switching to DialogState');
			return new DialogState();
		}
		[background, player, ...gameInterface].map(
			thing => thing.update && thing.update({ currentMap, player, eventState })
		);
	}

	handleInput({ input, background, player, gameInterface, currentMap, eventState }) {
		[background, player, ...gameInterface].map(
			thing => thing.handleInput && thing.handleInput({ input, currentMap, eventState })
		);
	}
}

export class DialogState extends GameState {
	constructor() {
		super('dialog');
		this.currentDialogKey = null;
	}

	// TODO: move all this dialog stuff to a SpaceThing
	createDialog(game) {
		const boxPadding = 10;
		const box = game.rectangle(gameWidth - 40, 250, 0x00335a, 0x0f95ff, 2);

		const dialogText = this.createTextAreaForDialog(game, box, boxPadding);
		box.addChild(dialogText);

		box.optionArea = game.group();
		const optionAreaHeight = 90;
		box.optionArea.position.set(boxPadding, box.height - optionAreaHeight);
		box.addChild(box.optionArea);

		box.zIndex = 15;
		box.position.set(20, gameHeight - box.height - 10);
		box.visible = false;
		box.textArea = dialogText;
		box.boxPadding = boxPadding;
		game.mainContainer.addChild(box);
		return box;
	}

	createTextAreaForDialog(game, box, boxPadding) {
		// See formatting options: https://pixijs.io/pixi-text-style/#
		const dialogText = game.text('', {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 'white',
			wordWrap: true,
			wordWrapWidth: box.width - boxPadding * 2,
		});
		dialogText.zIndex = 16;
		dialogText.position.set(boxPadding, boxPadding);
		return dialogText;
	}

	createDialogOption(game, option, index) {
		const dialogText = game.text(option.text, {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 'white',
		});
		const paddingForArrow = 28;
		const textHeight = 35;
		dialogText.position.set(paddingForArrow, index * textHeight);
		return dialogText;
	}

	createDialogOptions(game, dialog, currentDialogObject) {
		dialog.optionArea.removeChildren();

		currentDialogObject.options.map((option, index) => {
			const optionTextArea = this.createDialogOption(game, option, index);
			dialog.optionArea.addChild(optionTextArea);
			return optionTextArea;
		});

		const arrow = game.sprite('assets/pointer.png');
		arrow.anchor.set(0.5, 0.5);
		arrow.position.set(10, arrow.height);
		dialog.optionArea.addChild(arrow);

		const textHeight = 32;
		dialog.changeSelectedOption = index => {
			arrow.y = arrow.height + index * textHeight;
		};

		arrow.visible = !!currentDialogObject.options.length;
	}

	update({ game, eventState, currentMap }) {
		if (!eventState.getDialog()) {
			this.dialogSprite && this.dialogSprite.destroy();
			this.dialogSprite = null;
			debug('switching to FlyingState');
			return new FlyingState();
		}
		if (!this.dialogSprite) {
			this.dialogSprite = this.createDialog(game);
		}
		if (eventState.getDialog() !== this.currentDialogKey) {
			const dialog = new DialogManager({
				getState: eventState.getState,
				handleAction: eventState.dispatchAction,
				currentMap,
			});
			const currentDialogObject = dialog.getDialogObjectForKey(eventState.getDialog());
			this.currentDialogObject = currentDialogObject;
			if (currentDialogObject.script) {
				dialog.executeScript(currentDialogObject.script);
			}
			if (currentDialogObject.text) {
				this.dialogSprite.textArea.text = currentDialogObject.text;
				this.createDialogOptions(game, this.dialogSprite, currentDialogObject);
				this.currentOption = 0;
				this.dialogSprite.visible = true;
			}
			if (!currentDialogObject.text) {
				eventState.dispatchAction({ type: 'DIALOG_HIDE' });
			}
		}
		this.dialogSprite.changeSelectedOption(this.currentOption);
		this.currentDialogKey = eventState.getDialog();
	}

	handleInput({ input, eventState }) {
		if (!this.currentDialogObject) {
			return;
		}
		if (input.isKeyDown('KeyW') === true) {
			this.currentOption = clampNumber(
				this.currentOption - 1,
				0,
				this.currentDialogObject.options.length - 1
			);
		}
		if (input.isKeyDown('KeyS') === true) {
			this.currentOption = clampNumber(
				this.currentOption + 1,
				0,
				this.currentDialogObject.options.length - 1
			);
		}
		if (input.isKeyDownOnce('Space') === true) {
			const selectedOption = this.currentDialogObject.options[this.currentOption];
			if (!selectedOption) {
				return;
			}
			debug(
				'dialog',
				this.currentDialogKey,
				this.currentDialogObject,
				'selectedOption',
				selectedOption
			);
			if (selectedOption.link) {
				eventState.dispatchAction({
					type: 'DIALOG_TRIGGER',
					payload: selectedOption.link,
				});
			}
			if (!selectedOption.link) {
				eventState.dispatchAction({ type: 'DIALOG_HIDE' });
			}
		}
	}
}
