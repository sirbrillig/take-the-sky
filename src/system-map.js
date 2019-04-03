/* @format */

import { getPlanetsInSystem, getStarsInSystem } from './planets';
import Ship from './ship';
import { Star, Planet } from './stellar-objects';
import debugFactory from './debug';

const debug = debugFactory('sky:system');

export default class SystemMap {
	constructor({ game, systemName, player }) {
		this.game = game;
		this.player = player;
		this.planets = getPlanetsInSystem(systemName).map(
			({ position, size, name }) => new Planet({ game, position, size, name })
		);
		this.stars = getStarsInSystem(systemName).map(
			({ position, size, name }) => new Star({ game, position, size, name })
		);
		this.ships = [];
	}

	createShip({ type, name, behavior }) {
		debug('Creating new ship', type, name, behavior);
		this.ships.push(new Ship({ game: this.game, type, name, behavior, player: this.player }));
	}

	update({ player, eventState }) {
		this.ships = this.ships.filter(ship => {
			ship.update({ currentMap: this, player, eventState });
			return ship.alive;
		});
	}

	remove() {
		this.planets.forEach(planet => planet.sprite.sprite.destroy());
		this.planets = [];
		this.stars.forEach(star => star.sprite.sprite.destroy());
		this.stars = [];
		this.ships.forEach(ship => ship.sprite.sprite.destroy());
		this.ships = [];
	}

	handleInput({ game, input, player }) {
		if (input.isKeyDownOnce('KeyJ') === true) {
			debug('jump');
			this.remove();
			// TODO: figure out next system name
			return new SystemMap({ game, systemName: 'Betan', player });
		}
	}
}
