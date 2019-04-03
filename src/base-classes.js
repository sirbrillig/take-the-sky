/* @format */

import { makeUniqueId } from './math';
import Vector from './vector';

export class SpaceThing {
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

	toString() {
		return `SpaceThing id ${this.id}`;
	}
}

export class Health {
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

	toString() {
		return `Health ${this.getHealthAsPercent()}%`;
	}
}

export class Physics {
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

export class Sprite {
	constructor(game, physics) {
		this.physics = physics;
		this.sprite = '';
	}

	handleInput() {}

	update() {}
}
