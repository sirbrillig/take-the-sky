/* @format */

import createGame from './pixi-wrapper';
import { adjustSpeedForRotation, adjustRotationForDirection, makeUniqueId } from './math';
import Vector from './vector';
import { getPlanetsInSystem, getStarsInSystem } from './planets';
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
		this.hitBox = new Vector();
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
		this.hitBox = new Vector();
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
		game.mainContainer.addChild(this.sprite);
	}

	update() {
		this.sprite.tilePosition.x = this.game.gameSpace.position.x;
		this.sprite.tilePosition.y = this.game.gameSpace.position.y;
	}
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

	return new Input(keyMap);
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
	constructor({ position, name, size }) {
		super();
		this.name = name;
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
		this.physics = new PlanetPhysics({ position, size, name });
		this.sprite = new PlanetSprite(game, this.physics);
	}
}

class Star extends SpaceThing {
	constructor({ game, position, size, name }) {
		super({ game });
		this.physics = new StarPhysics({ position, size, name });
		this.sprite = new StarSprite(game, this.physics);
		this.showHitBox = true;

		if (this.showHitBox) {
			const box = game.rectangle(this.physics.hitBox.x, this.physics.hitBox.y, 0xff0000);
			box.position.set(
				this.physics.position.x - box.width / 2,
				this.physics.position.y - box.height / 2
			);
			this.game.gameSpace.addChild(box);
		}
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

class GameController {
	constructor({ game }) {
		this.game = game;

		// The gameSpace holds all objects which exist on the map (eg: ships)
		game.gameSpace = game.group();
		game.gameSpace.position.set(0, 0);
		// The mainContainer holds all objects which exist outside the map (eg: health)
		game.mainContainer.addChild(game.gameSpace);

		this.player = new Player({ game });
		this.background = new Background({ game });

		this.input = initInput();

		this.currentMap = new SystemMap({ game, systemName: 'Algol' });

		sortSpritesByZIndex(game.mainContainer);
		sortSpritesByZIndex(game.gameSpace);
	}

	tick() {
		this.handleInput([this.background, this.player], this.input);
		this.update([this.background, this.player]);
		this.centerCamera({
			gameSpace: this.game.gameSpace,
			playerPosition: this.player.physics.position,
		});
	}

	update(things) {
		things.map(thing => thing.update && thing.update());
	}

	handleInput(things, input) {
		things.map(thing => thing.handleInput && thing.handleInput(input));
	}

	centerCamera({ gameSpace, playerPosition }) {
		const currentPosition = new Vector(gameSpace.position.x, gameSpace.position.y);
		const distanceMoved = playerPosition.sub(currentPosition);
		const gameSpacePosition = currentPosition
			.add(distanceMoved)
			.invert()
			.add(new Vector(400, 300));
		gameSpace.position.set(gameSpacePosition.x, gameSpacePosition.y);
	}
}

function initGame() {
	const setupCallback = game => {
		const controller = new GameController({ game });
		game.ticker.add(() => controller.tick());
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
