/* @format */

import debugFactory from './debug';
import { adjustNumberBetween } from './math';
import { makeShipData } from './other-ships';

const debug = debugFactory('sky:state');

function npc(state = { happiness: 0 }, action = {}) {
	return { happiness: state.happiness + action.happiness || 0 };
}

function npcs(state, { type }) {
	switch (type) {
		case 'EVENT_FIRST_LANDING_NOT_DONE':
			return { ...state, engineer: npc(state.engineer, { happiness: -1 }) };
		default:
			return (
				state || {
					engineer: npc(),
				}
			);
	}
}

function events(state = {}, { type }) {
	switch (type) {
		case 'EVENT_FIRST_LANDING':
			return { ...state, firstLanding: true };
		case 'EVENT_STAR_WARNING':
			return { ...state, starsAreHot: true };
		case 'EVENT_GAME_OVER':
			return { ...state, gameOver: true };
		default:
			return state;
	}
}

function currentSystem(state = 'Algol', { type, payload }) {
	switch (type) {
		case 'CHANGE_SYSTEM':
			return payload;
		default:
			return state;
	}
}

function position(state = { x: 100, y: 100 }, { type, payload }) {
	switch (type) {
		case 'CHANGE_SYSTEM_POSITION':
			return payload;
		default:
			return state;
	}
}

function shipHealth(state = 100, { type, payload }) {
	switch (type) {
		case 'HEALTH_CHANGE':
			return adjustNumberBetween(payload, 0, 100);
		default:
			return state;
	}
}

function otherShips(state = [], { type, payload }) {
	switch (type) {
		case 'EVENT_FIRST_LANDING':
			return [...state, makeShipData('cruiser')];
		case 'CHANGE_OTHER_SHIP_DATA': {
			const ship = state.find(otherShip => otherShip.shipId === payload.shipId);
			if (!ship) {
				throw new Error(`Ship not found when trying to change ship data for id ${payload.shipId}`);
			}
			return [
				...state.filter(otherShip => otherShip.shipId === payload.shipId),
				{ ...ship, payload },
			];
		}
		default:
			return state;
	}
}

export default function reducer(state = {}, action) {
	const updated = {
		npcs: npcs(state.npcs, action),
		events: events(state.events, action),
		position: position(state.position, action),
		currentSystem: currentSystem(state.currentSystem, action),
		shipHealth: shipHealth(state.shipHealth, action),
		otherShips: otherShips(state.otherShips, action),
	};
	debug(state, action, updated);
	return updated;
}
