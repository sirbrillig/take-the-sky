/* @format */

import createGame from './pixi-wrapper';
import {
	clampNumber,
	adjustSpeedForRotation,
	adjustRotationForDirection,
	makeUniqueId,
} from './math';
import Vector from './vector';
import { getPlanetsInSystem, getStarsInSystem } from './planets';
import debugFactory from './debug';
import reducer from './state-reducer';
import Dialog from './dialog';

const debug = debugFactory('sky:game');

const gameWidth = 800;
const gameHeight = 600;
const filesToLoad = [
	'assets/player-idle.png',
	'assets/cruiser.png',
	'assets/sun.png',
	'assets/planet-1.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/pointer.png',
	'assets/bolt-red.png',
	'assets/explosion.json',
];

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

class SpaceThing {
	constructor({ game }) {
		this.game = game;
		this.id = makeUniqueId();
	}

	handleInput() {}

	update() {}

	renderHitBox() {
		const box = this.game.rectangle(this.physics.hitBox.x, this.physics.hitBox.y, 0xff0000);
		box.position.set(
			this.physics.position.x - box.width / 2,
			this.physics.position.y - box.height / 2
		);
		this.game.gameSpace.addChild(box);
	}
}

class Health {
	constructor(totalHealth) {
		this.totalHealth = totalHealth;
		this.current = totalHealth;
	}

	decrease(amount) {
		this.current -= amount;
		if (this.current < 0) {
			this.current = 0;
		}
	}

	getHealthAsPercent() {
		return (this.current / this.totalHealth) * 100;
	}
}

class Physics {
	constructor() {
		this.position = new Vector(0, 0);
		this.velocity = new Vector(0, 0);
		this.rotation = 0; // radians
		this.accelerationRate = 0.04;
		this.rotationRate = 0.06;
		this.maxVelocity = 3;
		this.hitBox = new Vector(0, 0);
	}

	isTouching(physics) {
		// Find the center points of each sprite
		const r1CenterX = this.position.x;
		const r1CenterY = this.position.y;
		const r2CenterX = physics.position.x;
		const r2CenterY = physics.position.y;

		// Allow using hitBox property instead of width/height if it exists
		const r1Width = this.hitBox.x;
		const r1Height = this.hitBox.y;
		const r2Width = physics.hitBox.x;
		const r2Height = physics.hitBox.y;

		// Find the half-widths and half-heights of each sprite
		const r1HalfWidth = r1Width / 2;
		const r1HalfHeight = r1Height / 2;
		const r2HalfWidth = r2Width / 2;
		const r2HalfHeight = r2Height / 2;

		// Calculate the distance vector between the sprites
		const vx = r1CenterX - r2CenterX;
		const vy = r1CenterY - r2CenterY;

		// Figure out the combined half-widths and half-heights
		const combinedHalfWidths = r1HalfWidth + r2HalfWidth;
		const combinedHalfHeights = r1HalfHeight + r2HalfHeight;

		// Check for a collision on the x axis
		if (Math.abs(vx) < combinedHalfWidths) {
			// A collision might be occurring. Check for a collision on the y axis
			if (Math.abs(vy) < combinedHalfHeights) {
				// There's definitely a collision happening
				return true;
			}
			// There's no collision on the y axis
			return false;
		}
		return false;
	}

	handleInput() {}

	update() {}
}

class PlayerPhysics extends Physics {
	constructor() {
		super();
		this.position.set(gameWidth / 2, gameHeight / 2);
		this.accelerationRate = 0.04;
		this.rotationRate = 0.06;
		this.maxVelocity = 3;
		this.hitBox = new Vector(64, 64);
	}

	handleInput({ input, currentMap, eventState }) {
		if (input.isKeyDown('KeyW') === true) {
			this.velocity = adjustSpeedForRotation(
				this.rotation,
				this.velocity,
				this.accelerationRate,
				this.maxVelocity
			);
			debug(`accelerating player to ${this.velocity}`);
		}
		if (input.isKeyDown('KeyD') === true) {
			this.rotation = adjustRotationForDirection(this.rotation, 'clockwise', this.rotationRate);
			debug(`rotating player clockwise to ${this.rotation}`);
		}
		if (input.isKeyDown('KeyA') === true) {
			this.rotation = adjustRotationForDirection(
				this.rotation,
				'counterclockwise',
				this.rotationRate
			);
			debug(`rotating player counterclockwise to ${this.rotation}`);
		}
		if (input.isKeyDown('KeyL') === true) {
			const touchingPlanet = currentMap.planets.find(planet => this.isTouching(planet.physics));
			if (touchingPlanet) {
				eventState.dispatchAction({
					type: 'DIALOG_TRIGGER',
					payload: `landingPlanet${touchingPlanet.name}`,
				});
			}
		}
	}

	update() {
		// The grid is upside down (0,0 is top left) so we subtract
		this.position = this.position.sub(this.velocity);
		debug(`moving player to ${this.position}`);
	}
}

class ShipPhysics extends Physics {
	constructor() {
		super();
		// TODO: set these from the constructor
		this.position.set(gameWidth / 2, gameHeight / 2);
		this.accelerationRate = 0.04;
		this.rotationRate = 0.06;
		this.maxVelocity = 3;
		this.hitBox = new Vector(64, 64);
	}

	update() {
		// The grid is upside down (0,0 is top left) so we subtract
		this.position = this.position.sub(this.velocity);
		debug(`moving ship ${this.id} to ${this.position}`);
	}
}

class Sprite {
	constructor(game, physics) {
		this.physics = physics;
		this.sprite = '';
	}

	handleInput() {}

	update() {}
}

class PlayerSprite extends Sprite {
	constructor(game, physics) {
		super(game, physics);
		this.alive = true;

		this.idle = game.sprite('assets/player-idle.png');
		this.idle.rotation = physics.rotation;
		this.idle.pivot.set(0.5, 0.5);
		this.idle.anchor.set(0.5, 0.5);
		this.idle.position.set(physics.position.x, physics.position.y);
		this.idle.zIndex = 10;
		this.idle.visible = false;
		game.gameSpace.addChild(this.idle);

		const movingImages = ['assets/player-engine-on-1.png', 'assets/player-engine-on-2.png'];
		this.moving = game.animatedSpriteFromImages(movingImages);
		this.moving.animationSpeed = 0.2;
		this.moving.pivot.set(0.5, 0.5);
		this.moving.anchor.set(0.5, 0.5);
		this.moving.position.set(physics.position.x, physics.position.y);
		this.moving.zIndex = 10;
		this.moving.loop = true;
		this.moving.visible = false;
		game.gameSpace.addChild(this.moving);

		this.explosion = game.animatedSpriteFromSpriteSheet('assets/explosion.json');
		this.explosion.position.set(physics.position.x, physics.position.y);
		this.explosion.animationSpeed = 0.6;
		this.explosion.loop = false;
		this.explosion.pivot.set(0.5, 0.5);
		this.explosion.anchor.set(0.5, 0.5);
		this.explosion.zIndex = 10;
		this.explosion.visible = false;
		game.gameSpace.addChild(this.explosion);

		this.sprite = this.idle;
	}

	handleInput({ input }) {
		if (!this.alive) {
			return;
		}
		if (input.isKeyDown('KeyW') === true) {
			this.sprite.visible = false;
			this.sprite = this.moving;
			this.sprite.visible = true;
			this.sprite.play();
			return;
		}
		if (this.sprite.stop) {
			this.sprite.stop();
		}
		this.sprite.visible = false;
		this.sprite = this.idle;
		this.sprite.visible = true;
	}

	update({ player, eventState }) {
		// TODO: stop any animations if the GameState has changed!
		if (!this.alive) {
			this.physics.velocity = new Vector(0, 0);
			return;
		}
		if (player.health.getHealthAsPercent() === 0) {
			this.sprite.visible = false;
			this.sprite = this.explosion;
			this.sprite.onComplete = () => {
				this.explosion.visible = false;
				eventState.dispatchAction({ type: 'DIALOG_TRIGGER', payload: 'explodedShip' });
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

class ShipSprite extends Sprite {
	constructor(game, physics) {
		super(game, physics);
		this.alive = true;

		// TODO: set sprite from constructor
		this.normal = game.sprite('assets/cruiser.png');
		this.normal.rotation = physics.rotation;
		this.normal.pivot.set(0.5, 0.5);
		this.normal.anchor.set(0.5, 0.5);
		this.normal.position.set(physics.position.x, physics.position.y);
		this.normal.zIndex = 10;
		this.normal.visible = false;
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

	update({ health }) {
		if (!this.alive) {
			this.physics.velocity = new Vector(0, 0);
			return;
		}
		if (health.getHealthAsPercent() === 0) {
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

class Player extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.physics = new PlayerPhysics();
		this.sprite = new PlayerSprite(game, this.physics);
		this.health = new Health(1000);
	}

	handleInput({ input, currentMap, eventState }) {
		this.physics.handleInput({ player: this, input, currentMap, eventState });
		this.sprite.handleInput({ player: this, input, currentMap, eventState });
	}

	update({ currentMap, eventState }) {
		this.physics.update(this);
		this.sprite.update({ eventState, currentMap, player: this });
		if (currentMap.stars.find(star => this.physics.isTouching(star.physics))) {
			this.health.decrease(4);
		}
	}
}

class Ship extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.physics = new ShipPhysics();
		this.sprite = new ShipSprite(game, this.physics);
		// TODO: set this in constructor
		this.health = new Health(400);
	}

	update({ currentMap, eventState }) {
		this.physics.update(this);
		this.sprite.update({ eventState, currentMap, health: this.health });
		if (currentMap.stars.find(star => this.physics.isTouching(star.physics))) {
			this.health.decrease(4);
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
	constructor({ game, systemName }) {
		this.planets = getPlanetsInSystem(systemName).map(
			({ position, size, name }) => new Planet({ game, position, size, name })
		);
		this.stars = getStarsInSystem(systemName).map(
			({ position, size, name }) => new Star({ game, position, size, name })
		);
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

	update({ game, eventState }) {
		if (!eventState.getDialog()) {
			this.dialogSprite && this.dialogSprite.destroy();
			this.dialogSprite = null;
			return new FlyingState();
		}
		if (!this.dialogSprite) {
			this.dialogSprite = this.createDialog(game);
		}
		if (eventState.getDialog() !== this.currentDialog) {
			const dialog = new Dialog({
				getState: eventState.getState,
				handleAction: eventState.dispatchAction,
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

	handleInput({ input, eventState }) {
		const dialog = new Dialog({
			getState: eventState.getState,
			handleAction: eventState.dispatchAction,
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
		this.ships = [];
		// TODO: how do we add a ship to be tracked/updated?

		this.input = new Input();

		this.currentMap = new SystemMap({ game, systemName: 'Algol' });

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
