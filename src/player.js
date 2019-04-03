/* @format */

import { SpaceThing, Physics, Sprite, Health } from './base-classes';
import Vector from './vector';
import { adjustSpeedForRotation, adjustRotationForDirection } from './math';
import Smoke from './smoke';
import debugFactory from './debug';
import { gameWidth, gameHeight } from './constants';

const debug = debugFactory('sky:player');

export default class Player extends SpaceThing {
	constructor({ game }) {
		super({ game });
		this.physics = new PlayerPhysics();
		this.sprite = new PlayerSprite(game, this.physics);
		this.health = new Health(1000);
		this.tookDamage = false;
	}

	handleInput({ input, currentMap, eventState }) {
		this.physics.handleInput({ player: this, input, currentMap, eventState });
		this.sprite.handleInput({ player: this, input, currentMap, eventState });
	}

	update({ currentMap, eventState }) {
		this.physics.update(this);
		this.tookDamage = false;
		if (currentMap.stars.find(star => this.physics.isTouching(star.physics))) {
			this.health.decrease(4);
			this.tookDamage = true;
		}
		this.sprite.update({ eventState, currentMap, player: this });
	}

	resetPosition() {
		this.physics.position.set(gameWidth / 2, gameHeight / 2);
	}
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
		if (input.isKeyDownOnce('Space') === true) {
			const touchingPlanet = currentMap.planets.find(planet => this.isTouching(planet.physics));
			if (touchingPlanet) {
				this.velocity = new Vector(0, 0);
				eventState.dispatchAction({
					type: 'DIALOG_TRIGGER',
					payload: `landingPlanet${touchingPlanet.name}`,
				});
			}
		}
		if (input.isKeyDownOnce('KeyJ') === true) {
			debug('jump');
			// TODO: require touching quantum cloud
			// TODO: require charging jump meter
			// TODO: prompt for target system
			eventState.dispatchAction({ type: 'SYSTEM_CHANGE', payload: 'Betan' });
		}
	}

	update() {
		// The grid is upside down (0,0 is top left) so we subtract
		this.position = this.position.sub(this.velocity);
		debug(`moving player to ${this.position}`);
	}
}

class PlayerSprite extends Sprite {
	constructor(game, physics) {
		super(game, physics);
		this.alive = true;
		this.game = game;

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

		this.smokeTrail = [];
		this.lastSmokedAt = Date.now();
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
		const smokeDelay = 150;
		if (player.tookDamage && Date.now() - this.lastSmokedAt > smokeDelay) {
			const smoke = new Smoke({ game: this.game, targetPosition: this.physics.position });
			this.smokeTrail.push(smoke);
			this.lastSmokedAt = Date.now();
		}
		this.smokeTrail = this.smokeTrail.filter(smoke => smoke.update());
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
