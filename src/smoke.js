/* @format */

import { SpaceThing, Physics, Sprite } from './base-classes';

export default class Smoke extends SpaceThing {
	constructor({ game, targetPosition }) {
		super({ game });
		this.physics = new SmokePhysics({ targetPosition });
		this.sprite = new SmokeSprite({ game, physics: this.physics });
	}

	update() {
		return this.sprite.alive;
	}
}

class SmokePhysics extends Physics {
	constructor({ targetPosition }) {
		super();
		this.position.set(targetPosition.x, targetPosition.y);
	}
}

class SmokeSprite extends Sprite {
	constructor({ game, physics }) {
		super(game, physics);
		this.alive = true;

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
			this.sprite.destroy();
			this.alive = false;
		};
		this.sprite.play();
	}
}
