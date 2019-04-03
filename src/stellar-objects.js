/* @format */

import { Sprite, Physics, SpaceThing } from './base-classes';
import Vector from './vector';

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

export class Planet extends SpaceThing {
	constructor({ game, position, size, name }) {
		super({ game });
		this.name = name;
		this.physics = new PlanetPhysics({ position, size, name });
		this.sprite = new PlanetSprite(game, this.physics);
	}
}

export class Star extends SpaceThing {
	constructor({ game, position, size, name }) {
		super({ game });
		this.physics = new StarPhysics({ position, size, name });
		this.sprite = new StarSprite(game, this.physics);
	}
}
