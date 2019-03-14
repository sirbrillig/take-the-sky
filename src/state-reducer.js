/* @format */

import debugFactory from './debug';

const debug = debugFactory('sky');

function events(state = {}, { type, payload }) {
	switch (type) {
		case 'EVENT_FIRST_LANDING':
			return { ...state, firstLanding: true };
		case 'EVENT_STAR_WARNING':
			return { ...state, starsAreHot: true };
		case 'EVENT_GAME_OVER':
			return { ...state, gameOver: true };
		case 'EVENT_FIRST_LANDING_NOT_DONE':
			return { ...state, firstLandingNotDone: payload };
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

function position(state = {}, { type, payload }) {
	switch (type) {
		case 'CHANGE_SYSTEM_POSITION':
			return payload;
		default:
			return state;
	}
}

export default function reducer(state, action) {
	debug(state, action);
	return {
		events: events(state.events, action),
		position: position(state.position, action),
		currentSystem: currentSystem(state.currentSystem, action),
	};
}
