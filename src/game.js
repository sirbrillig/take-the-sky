/* @format */

import createGame from './pixi-wrapper';
import { adjustSpeedForRotation, adjustRotationForDirection, makeUniqueId } from './math';
import Vector from './vector';
import debugFactory from './debug';

const debug = debugFactory('sky:game');

const canvasWidth = 800;
const canvasHeight = 600;
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
	constructor(keyMap) {
		this.keyMap = keyMap;
	}

	isKeyDown(keyCode) {
		return this.keyMap[keyCode] === true;
	}
}

class SpaceThing {
	constructor({ game }) {
		this.game = game;
		this.id = makeUniqueId();
	}

	handleInput() {}

	update() {}
}

class Health {
	constructor(totalHealth) {
		this.totalHealth = totalHealth;
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
		this.width = 0;
		this.height = 0;
	}

	handleInput() {}

	update() {}
}

class PlayerPhysics extends Physics {
	constructor() {
		super();
		this.position.set(400, 300);
		this.accelerationRate = 0.04;
		this.rotationRate = 0.06;
		this.maxVelocity = 3;
		this.width = 64;
		this.height = 64;
	}

	handleInput(player, input) {
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
	}

	update() {
		// The grid is upside down (0,0 is top left) so we subtract
		this.position = this.position.sub(this.velocity);
		debug(`moving player to ${this.position}`);
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

		this.sprite = this.idle;
	}

	handleInput(player, input) {
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

	update() {
		this.sprite.rotation = this.physics.rotation;
		this.sprite.position.set(this.physics.position.x, this.physics.position.y);
	}
}

class Player extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.physics = new PlayerPhysics();
		this.sprite = new PlayerSprite(game, this.physics);
		this.health = new Health(500);
	}

	handleInput(input) {
		this.physics.handleInput(this, input);
		this.sprite.handleInput(this, input);
	}

	update() {
		this.physics.update(this);
		this.sprite.update(this);
	}
}

class Background extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.sprite = game.tilingSprite('assets/star-field.png', game.canvasWidth, game.canvasHeight);
		this.sprite.zIndex = 0;
		game.gameSpace.addChild(this.sprite);
	}
}

function initThings(game) {
	return [new Player({ game }), new Background({ game })];
}

function update(things) {
	things.map(thing => thing.update());
}

function handleInput(things, input) {
	things.map(thing => thing.handleInput(input));
}

function initInput() {
	const keyMap = {};
	const onKeyDown = event => {
		keyMap[event.code] = true;
	};
	const onKeyUp = event => {
		keyMap[event.code] = null;
	};

	window.document.addEventListener('keydown', onKeyDown); // eslint-disable-line no-undef
	window.document.addEventListener('keyup', onKeyUp); // eslint-disable-line no-undef

	return function getInput() {
		return new Input(keyMap);
	};
}

function sortSpritesByZIndex(container) {
	// sort sprites by zorder
	container.children.sort((a, b) => {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;
		return a.zIndex > b.zIndex ? 1 : -1;
	});
}

function initGame() {
	const setupCallback = game => {
		const gameSpace = game.group();
		game.mainContainer.addChild(gameSpace);
		game.gameSpace = gameSpace;
		const things = initThings(game);
		sortSpritesByZIndex(game.gameSpace);
		const getInput = initInput();
		game.ticker.add(() => {
			const input = getInput();
			handleInput(things, input);
			update(things);
		});
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
