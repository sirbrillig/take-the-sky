/* @format */

import debugFactory from './debug';

const debug = debugFactory('sky');

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

export default function reducer(state = {}, action) {
	debug(state, action);
	return {
		npcs: npcs(state.npcs, action),
		events: events(state.events, action),
		position: position(state.position, action),
		currentSystem: currentSystem(state.currentSystem, action),
	};
}
