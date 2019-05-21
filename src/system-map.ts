/* @format */

import { getPlanetsInSystem, getStarsInSystem } from './planets';
import Ship from './ship';
import { Star, Planet } from './stellar-objects';
import Player from './player';
import Game from './game';
import debugFactory from './debug';

const debug = debugFactory('sky:system');

export default class SystemMap {
	public game: Game;

	public player: Player;

	public systemName: string;

	public planets: Planet[];

	public stars: Star[];

	public ships: Ship[];

	public constructor({
		game,
		systemName,
		player,
	}: {
		game: Game;
		systemName: string;
		player: Player;
	}) {
		this.game = game;
		this.player = player;
		this.systemName = systemName;
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
}
