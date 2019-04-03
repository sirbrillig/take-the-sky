/* @format */

import createGame from './pixi-wrapper';
import Vector from './vector';
import reducer from './state-reducer';
import { SpaceThing } from './base-classes';
import Player from './player';
import { FlyingState } from './game-state';
import { gameWidth, gameHeight, filesToLoad } from './constants';
import SystemMap from './system-map';

class Input {
	constructor() {
		this.keyMap = {};
		const onKeyDown = event => {
			this.keyMap[event.code] = true;
		};
		const onKeyUp = event => {
			this.keyMap[event.code] = null;
		};

		window.document.addEventListener('keydown', onKeyDown); // eslint-disable-line no-undef
		window.document.addEventListener('keyup', onKeyUp); // eslint-disable-line no-undef
	}

	isKeyDown(keyCode) {
		return this.keyMap[keyCode] === true;
	}

	/**
	 * Unsets the key if it is down
	 */
	isKeyDownOnce(keyCode) {
		if (this.keyMap[keyCode] === true) {
			this.keyMap[keyCode] = null;
			return true;
		}
		return false;
	}
}

class Background extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.sprite = game.tilingSprite('assets/star-field.png', game.gameWidth, game.gameHeight);
		this.sprite.zIndex = 0;
		game.mainContainer.addChild(this.sprite);
	}

	update() {
		this.sprite.tilePosition.x = this.game.gameSpace.position.x;
		this.sprite.tilePosition.y = this.game.gameSpace.position.y;
	}
}

function sortSpritesByZIndex(container) {
	// sort sprites by zorder
	container.children.sort((a, b) => {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;
		return a.zIndex > b.zIndex ? 1 : -1;
	});
}

class HealthBar extends SpaceThing {
	constructor({ game, health }) {
		super({ game });
		this.health = health;

		this.maxBarWidth = 164;
		const outerBar = game.rectangle(this.maxBarWidth, 24, 0x000000, 0x008000, 2);
		const innerBar = game.rectangle(this.maxBarWidth, 24, 0x008000);
		const meterLabel = game.text('Hull strength', {
			fontFamily: 'Arial',
			fontSize: 20,
			fill: 0xffffff,
		});
		const meter = game.group();
		meter.addChild(outerBar);
		meter.addChild(innerBar);
		meter.addChild(meterLabel);
		meterLabel.position.set(-120, 0);
		meter.innerBar = innerBar;
		meter.outerBar = outerBar;
		const padding = 20;
		meter.position.set(gameWidth - outerBar.width - padding, 16);
		meter.zIndex = 15;
		this.meter = meter;
		game.mainContainer.addChild(meter);
	}

	convertPercentToBarWidth(percent) {
		return this.maxBarWidth * (percent / 100);
	}

	update() {
		this.meter.innerBar.width = this.convertPercentToBarWidth(this.health.getHealthAsPercent());
	}
}

class EventState {
	constructor() {
		this.stateTree = reducer(undefined, { type: 'INIT' });
		this.getState = this.getState.bind(this);
		this.getEvent = this.getEvent.bind(this);
		this.getDialog = this.getDialog.bind(this);
		this.dispatchAction = this.dispatchAction.bind(this);
	}

	dispatchAction(event) {
		this.stateTree = reducer(this.stateTree, event);
	}

	getState() {
		return this.stateTree;
	}

	getEvent(key) {
		return this.stateTree.events[key];
	}

	getDialog() {
		return this.stateTree.dialog;
	}
}

class GameController {
	constructor({ game }) {
		this.game = game;

		// The gameSpace holds all objects which exist on the map (eg: ships)
		game.gameSpace = game.group();
		game.gameSpace.position.set(0, 0);
		// The mainContainer holds all objects which exist outside the map (eg: health)
		game.mainContainer.addChild(game.gameSpace);

		this.eventState = new EventState();

		this.player = new Player({ game });
		this.background = new Background({ game });
		this.gameInterface = [new HealthBar({ game, health: this.player.health })];

		this.input = new Input();

		this.currentMap = new SystemMap({ game, systemName: 'Algol', player: this.player });

		sortSpritesByZIndex(game.mainContainer);
		sortSpritesByZIndex(game.gameSpace);

		this.state = new FlyingState();
	}

	tick() {
		this.handleInput();
		this.update();
		this.centerCamera({
			gameSpace: this.game.gameSpace,
			playerPosition: this.player.physics.position,
		});
	}

	update() {
		const newState = this.state.update({
			player: this.player,
			background: this.background,
			gameInterface: this.gameInterface,
			input: this.input,
			currentMap: this.currentMap,
			eventState: this.eventState,
			game: this.game,
		});
		if (newState) {
			this.state = newState;
		}
		this.currentMap.update({ player: this.player, eventState: this.eventState });
	}

	handleInput() {
		this.state.handleInput({
			player: this.player,
			background: this.background,
			gameInterface: this.gameInterface,
			input: this.input,
			currentMap: this.currentMap,
			eventState: this.eventState,
		});
		const newMap = this.currentMap.handleInput({
			game: this.game,
			input: this.input,
			player: this.player,
		});
		if (newMap) {
			this.currentMap = newMap;
			sortSpritesByZIndex(this.game.gameSpace);
			this.player.resetPosition();
		}
	}

	centerCamera({ gameSpace, playerPosition }) {
		const currentPosition = new Vector(gameSpace.position.x, gameSpace.position.y);
		const distanceMoved = playerPosition.sub(currentPosition);
		const gameSpacePosition = currentPosition
			.add(distanceMoved)
			.invert()
			.add(new Vector(gameWidth / 2, gameHeight / 2));
		gameSpace.position.set(gameSpacePosition.x, gameSpacePosition.y);
	}
}

function initGame() {
	const setupCallback = game => {
		const controller = new GameController({ game });
		game.ticker.add(() => controller.tick());
	};
	createGame({ gameWidth, gameHeight, filesToLoad, setupCallback });
}

initGame();
