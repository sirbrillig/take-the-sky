/* @format */

import { SpaceThing, Physics, Sprite } from './base-classes';
import Vector from './vector';
import { adjustSpeedForRotation } from './math';

export default class Bolt extends SpaceThing {
	constructor({ game, player, ship }) {
		super({ game });
		this.player = player;
		this.physics = new BoltPhysics({ player, ship, bolt: this });
		this.sprite = new BoltSprite({ game, physics: this.physics, player, bolt: this });
		this.alive = true;
		this.isExploding = false;
		this.hasDealtDamage = false;
	}

	update() {
		if (!this.alive) {
			return;
		}
		this.physics.update(this);
		this.sprite.update(this);
		if (this.isExploding && this.physics.isTouching(this.player.physics) && !this.hasDealtDamage) {
			this.player.health.decrease(100);
			this.hasDealtDamage = true;
		}
		if (!this.sprite.alive) {
			this.alive = false;
		}
	}
}

class BoltPhysics extends Physics {
	constructor({ ship, player, bolt }) {
		super();
		this.bolt = bolt;
		this.player = player;
		this.startingPosition = ship.physics.position.clone();
		this.position.set(ship.physics.position.x, ship.physics.position.y); // TODO: move this to the ship's nose
		this.rotation = ship.physics.rotation;
		this.maxVelocity = 10;
		this.accelerationRate = 10;
		this.hitBox = new Vector(32, 32);
	}

	update() {
		if (this.isTouching(this.player.physics)) {
			this.bolt.isExploding = true;
		}
		const distanceMoved = this.startingPosition.sub(this.position).magnitude();
		if (distanceMoved > 400) {
			this.bolt.isExploding = true;
		}
		if (this.bolt.isExploding) {
			this.velocity = new Vector(0, 0);
			return;
		}
		this.velocity = adjustSpeedForRotation(
			this.rotation,
			this.velocity,
			this.accelerationRate,
			this.maxVelocity
		);
		this.position = this.position.sub(this.velocity);
	}
}

class BoltSprite extends Sprite {
	constructor({ game, physics, player, bolt }) {
		super(game, physics);
		this.alive = true;
		this.bolt = bolt;
		this.player = player;
		this.physics = physics;

		this.normal = game.sprite('assets/bolt-red.png');
		this.normal.rotation = physics.rotation;
		this.normal.pivot.set(0.5, 0.5);
		this.normal.anchor.set(0.5, 0.5);
		this.normal.position.set(physics.position.x, physics.position.y);
		this.normal.zIndex = 10;
		this.normal.visible = true;
		game.gameSpace.addChild(this.normal);

		this.explosion = game.animatedSpriteFromSpriteSheet('assets/explosion.json');
		this.explosion.width = 64;
		this.explosion.height = 64;
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

	update() {
		if (!this.alive) {
			return;
		}
		if (this.bolt.isExploding) {
			this.sprite.visible = false;
			this.sprite = this.explosion;
			this.sprite.onComplete = () => {
				this.explosion.visible = false;
				this.remove();
				this.alive = false;
			};
			this.sprite.position.set(this.physics.position.x, this.physics.position.y);
			this.sprite.visible = true;
			this.sprite.play();
			return;
		}
		this.sprite.rotation = this.physics.rotation;
		this.sprite.position.set(this.physics.position.x, this.physics.position.y);
	}
}
