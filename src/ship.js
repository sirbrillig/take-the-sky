/* @format */

import { SpaceThing, Physics, Sprite, Health } from './base-classes';
import Vector from './vector';
import debugFactory from './debug';
import { gameWidth, gameHeight } from './constants';
import Bolt from './bolt';
import DialogManager from './dialog-manager';

const debug = debugFactory('sky:ship');

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

export default class Ship extends SpaceThing {
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
