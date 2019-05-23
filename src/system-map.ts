/* @format */

import { getPlanetsInSystem, getStarsInSystem } from './planets';
import Ship from './ship';
import { Star, Planet } from './stellar-objects';
import Player from './player';
import EventState from './event-state';
import Game from './game';
import debugFactory from './debug';

const debug = debugFactory('sky:system');

export default class SystemMap {
	public readonly game: Game;

	public readonly player: Player;

	public readonly systemName: string;

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
			({ position, size, name }): Planet => new Planet({ game, position, size, name })
		);
		this.stars = getStarsInSystem(systemName).map(
			({ position, size, name }): Star => new Star({ game, position, size, name })
		);
		this.ships = [];
	}

	public createShip({ type, name, behavior }): void {
		debug('Creating new ship', type, name, behavior);
		this.ships.push(new Ship({ game: this.game, type, name, behavior, player: this.player }));
	}

	public update({ eventState }: { eventState: EventState }): void {
		this.ships = this.ships.filter(
			(ship: Ship): boolean => {
				ship.update({ currentMap: this, eventState });
				return ship.alive;
			}
		);
	}

	public remove(): void {
		this.planets.forEach((planet): void => planet.sprite.sprite.destroy());
		this.planets = [];
		this.stars.forEach((star): void => star.sprite.sprite.destroy());
		this.stars = [];
		this.ships.forEach((ship): void => ship.sprite.sprite.destroy());
		this.ships = [];
	}
}
