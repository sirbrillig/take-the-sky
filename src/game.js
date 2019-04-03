/* @format */

import createGame from './pixi-wrapper';
import { clampNumber } from './math';
import Vector from './vector';
import { getPlanetsInSystem, getStarsInSystem } from './planets';
import debugFactory from './debug';
import reducer from './state-reducer';
import DialogManager from './dialog-manager';
import { Sprite, Physics, SpaceThing, Health } from './base-classes';
import Player from './player';
import Bolt from './bolt';
import { gameWidth, gameHeight, filesToLoad } from './constants';

const debug = debugFactory('sky:game');

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

class ShipPhysics extends Physics {
	constructor({ player }) {
		super();
		const [x, y] = this.getOffScreenPositionFromPlayer(player);
		debug('Setting ship position', x, y);
		this.position.set(x, y);
		this.accelerationRate = 0.04;
		this.rotationRate = 0.06;
		this.maxVelocity = 4;
		this.hitBox = new Vector(64, 64);
	}

	getOffScreenPositionFromPlayer(player) {
		const sides = ['top', 'left', 'right', 'bottom'];
		const offScreenSide = sides[Math.floor(Math.random() * Math.floor(sides.length))];
		const margin = 100;
		const halfWidth = gameWidth / 2 + margin;
		const halfHeight = gameHeight / 2 + margin;
		switch (offScreenSide) {
			case 'left':
				return [player.physics.position.x - halfWidth, player.physics.position.y];
			case 'right':
				return [player.physics.position.x + halfWidth, player.physics.position.y];
			case 'top':
				return [player.physics.position.x, player.physics.position.y - halfHeight];
			case 'bottom':
				return [player.physics.position.x, player.physics.position.y + halfHeight];
			default:
				throw new Error(`Unknown offscreen direction ${offScreenSide}`);
		}
	}

	update() {
		// The grid is upside down (0,0 is top left) so we subtract
		this.position = this.position.sub(this.velocity);
	}
}

class ShipSprite extends Sprite {
	constructor({ game, physics, type, ship }) {
		super(game, physics);
		this.alive = true;
		this.ship = ship;

		this.normal = game.sprite(this.getSpriteFromType(type));
		this.normal.rotation = physics.rotation;
		this.normal.pivot.set(0.5, 0.5);
		this.normal.anchor.set(0.5, 0.5);
		this.normal.position.set(physics.position.x, physics.position.y);
		this.normal.zIndex = 10;
		this.normal.visible = true;
		game.gameSpace.addChild(this.normal);

		this.explosion = game.animatedSpriteFromSpriteSheet('assets/explosion.json');
		this.explosion.position.set(physics.position.x, physics.position.y);
		this.explosion.animationSpeed = 0.6;
		this.explosion.loop = false;
		this.explosion.pivot.set(0.5, 0.5);
		this.explosion.anchor.set(0.5, 0.5);
		this.explosion.zIndex = 10;
		this.explosion.visible = false;
		game.gameSpace.addChild(this.explosion);

		this.sprite = this.normal;
	}

	remove() {
		this.normal.destroy();
		this.explosion.destroy();
	}

	getSpriteFromType(type) {
		if (type === 'cruiser') {
			return 'assets/cruiser.png';
		}
		throw new Error(`Unknown ship type ${type}`);
	}

	update() {
		if (!this.alive) {
			this.physics.velocity = new Vector(0, 0);
			return;
		}
		if (this.ship.isExploding) {
			this.sprite.visible = false;
			this.sprite = this.explosion;
			this.sprite.onComplete = () => {
				this.explosion.visible = false;
			};
			this.sprite.position.set(this.physics.position.x, this.physics.position.y);
			this.sprite.visible = true;
			this.sprite.play();
			this.alive = false;
			return;
		}
		this.sprite.rotation = this.physics.rotation;
		this.sprite.position.set(this.physics.position.x, this.physics.position.y);
	}
}

class Behavior {
	constructor({ behaviorTokens }) {
		this.behaviorTokens = behaviorTokens;
	}

	update({ ship, player, eventState, currentMap }) {
		const dialog = new DialogManager({
			getState: eventState.getState,
			handleAction: eventState.dispatchAction,
			currentMap,
			player,
			ship,
		});
		dialog.executeStatements(this.behaviorTokens);
	}
}

class Ship extends SpaceThing {
	constructor({ game, type, name, behavior, player }) {
		super({ game });
		this.id = name;
		this.player = player;
		this.physics = new ShipPhysics({ player });
		this.sprite = new ShipSprite({ game, physics: this.physics, type, ship: this });
		this.health = new Health(100);
		this.behavior = new Behavior({ behaviorTokens: behavior });

		this.alive = true;
		this.isExploding = false;

		this.bolts = [];
		this.fire = this.fire.bind(this);
		this.lastFiredAt = Date.now();
		this.minFireWait = 2000;
	}

	update({ currentMap, eventState }) {
		if (this.alive && !this.isExploding) {
			this.behavior.update({
				ship: this,
				currentMap,
				eventState,
				player: this.player,
			});
			this.physics.update(this);
			debug(`moving ship ${this.id} to ${this.physics.position}`);
		}
		if (this.alive) {
			this.sprite.update({ eventState, currentMap, health: this.health });
			if (currentMap.stars.find(star => this.physics.isTouching(star.physics))) {
				this.health.decrease(4);
				debug(`sun damaging ship ${this.id} to ${this.health}`);
			}
			if (this.health.getHealthAsPercent() === 0) {
				this.isExploding = true;
			}
		}
		this.bolts = this.bolts.filter(bolt => {
			bolt.update({ ship: this, player: this.player, eventState, currentMap });
			return bolt.alive;
		});
		if (!this.alive) {
			this.sprite.remove();
		}
	}

	fire() {
		if (Date.now() - this.lastFiredAt > this.minFireWait) {
			this.lastFiredAt = Date.now();
			const bolt = new Bolt({ game: this.game, player: this.player, ship: this });
			this.bolts.push(bolt);
		}
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

class PlanetPhysics extends Physics {
	constructor({ position, size }) {
		super();
		this.size = size;
		this.position.set(position.x, position.y);
		this.hitBox = new Vector(size, size);
	}
}

class StarPhysics extends Physics {
	constructor({ position, name, size }) {
		super();
		this.name = name;
		this.size = size;
		this.position.set(position.x, position.y);
		// The star sprite has wide transparent edges so we make the hitBox smaller
		this.hitBox = new Vector(size / 1.5, size / 1.5);
	}
}

class PlanetSprite extends Sprite {
	constructor(game, physics) {
		super(game, physics);
		this.sprite = game.sprite('assets/planet-1.png');
		this.sprite.pivot.set(0.5, 0.5);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = physics.size;
		this.sprite.height = physics.size;
		this.sprite.position.set(physics.position.x, physics.position.y);
		this.sprite.zIndex = 8;
		game.gameSpace.addChild(this.sprite);
	}
}

class StarSprite extends Sprite {
	constructor(game, physics) {
		super(game, physics);
		this.sprite = game.sprite('assets/sun.png');
		this.sprite.pivot.set(0.5, 0.5);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.width = physics.size;
		this.sprite.height = physics.size;
		this.sprite.position.set(physics.position.x, physics.position.y);
		this.sprite.zIndex = 8;
		game.gameSpace.addChild(this.sprite);
	}
}

class Planet extends SpaceThing {
	constructor({ game, position, size, name }) {
		super({ game });
		this.name = name;
		this.physics = new PlanetPhysics({ position, size, name });
		this.sprite = new PlanetSprite(game, this.physics);
	}
}

class Star extends SpaceThing {
	constructor({ game, position, size, name }) {
		super({ game });
		this.physics = new StarPhysics({ position, size, name });
		this.sprite = new StarSprite(game, this.physics);
	}
}

class SystemMap {
	constructor({ game, systemName, player }) {
		this.game = game;
		this.player = player;
		this.planets = getPlanetsInSystem(systemName).map(
			({ position, size, name }) => new Planet({ game, position, size, name })
		);
		this.stars = getStarsInSystem(systemName).map(
			({ position, size, name }) => new Star({ game, position, size, name })
		);
		this.ships = [];
	}

	createShip({ type, name, behavior }) {
		debug('Creating new ship', type, name, behavior);
		this.ships.push(new Ship({ game: this.game, type, name, behavior, player: this.player }));
	}

	update({ player, eventState }) {
		this.ships = this.ships.filter(ship => {
			ship.update({ currentMap: this, player, eventState });
			return ship.alive;
		});
	}
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

class GameState {
	constructor(stateName) {
		this.stateName = stateName;
	}

	handleInput() {}

	update() {}
}

class FlyingState extends GameState {
	constructor() {
		super('flying');
	}

	update({ eventState, player, background, gameInterface, currentMap }) {
		if (eventState.getDialog()) {
			debug('switching to DialogState');
			return new DialogState();
		}
		[background, player, ...gameInterface, currentMap].map(
			thing => thing.update && thing.update({ currentMap, player, eventState })
		);
	}

	handleInput({ input, background, player, gameInterface, currentMap, eventState }) {
		[background, player, ...gameInterface, currentMap].map(
			thing => thing.handleInput && thing.handleInput({ input, currentMap, eventState })
		);
	}
}

class DialogState extends GameState {
	constructor() {
		super('dialog');
		this.currentDialog = null;
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
		if (eventState.getDialog() !== this.currentDialog) {
			const dialog = new DialogManager({
				getState: eventState.getState,
				handleAction: eventState.dispatchAction,
				currentMap,
			});
			const currentDialogObject = dialog.getDialogObjectForKey(eventState.getDialog());
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
		this.currentDialog = eventState.getDialog();
	}

	handleInput({ input, eventState, currentMap }) {
		const dialog = new DialogManager({
			getState: eventState.getState,
			handleAction: eventState.dispatchAction,
			currentMap,
		});
		const currentDialog = eventState.getDialog();
		if (!currentDialog) {
			return;
		}
		if (input.isKeyDown('KeyW') === true) {
			const currentDialogObject = dialog.getDialogObjectForKey(currentDialog);
			this.currentOption = clampNumber(
				this.currentOption - 1,
				0,
				currentDialogObject.options.length - 1
			);
		}
		if (input.isKeyDown('KeyS') === true) {
			const currentDialogObject = dialog.getDialogObjectForKey(currentDialog);
			this.currentOption = clampNumber(
				this.currentOption + 1,
				0,
				currentDialogObject.options.length - 1
			);
		}
		if (input.isKeyDownOnce('Space') === true) {
			const currentDialogObject = dialog.getDialogObjectForKey(currentDialog);
			const selectedOption = currentDialogObject.options[this.currentOption];
			if (!selectedOption) {
				return;
			}
			if (selectedOption.script) {
				dialog.executeScript(selectedOption.script);
			}
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
