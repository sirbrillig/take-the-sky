/* @format */

import { SpaceThing, Physics, Sprite } from './base-classes';

export default class Smoke extends SpaceThing {
	constructor({ game, player, ship }) {
		super({ game });
		this.player = player;
		this.physics = new SmokePhysics({ player, ship, smoke: this });
		this.sprite = new SmokeSprite({ game, physics: this.physics, player, smoke: this });
	}

	update() {
		return this.sprite.alive;
	}
}

class SmokePhysics extends Physics {
	constructor({ ship, player, smoke }) {
		super();
		this.smoke = smoke;
		this.player = player;
		this.startingPosition = ship.physics.position.clone();
		this.position.set(ship.physics.position.x, ship.physics.position.y);
	}
}

class SmokeSprite extends Sprite {
	constructor({ game, physics, player, smoke }) {
		super(game, physics);
		this.alive = true;
		this.smoke = smoke;
		this.player = player;
		this.physics = physics;

		this.sprite = game.animatedSpriteFromSpriteSheet('assets/smoke.json');
		this.sprite.width = 32;
		this.sprite.height = 32;
		this.sprite.position.set(physics.position.x, physics.position.y);
		this.sprite.animationSpeed = 0.6;
		this.sprite.loop = false;
		this.sprite.pivot.set(0.5, 0.5);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.zIndex = 10;
		this.sprite.visible = true;
		game.gameSpace.addChild(this.sprite);

		this.sprite.onComplete = () => {
			this.sprite.visible = false;
			this.remove();
			this.alive = false;
		};
		this.sprite.play();
	}

	remove() {
		this.sprite.destroy();
	}
}
