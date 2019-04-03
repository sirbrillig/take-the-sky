/* @format */

import debugFactory from './debug';

const debug = debugFactory('sky:state');

function npc(state = { happiness: 0 }, action = {}) {
	return { happiness: state.happiness + action.happiness || 0 };
}

function npcs(state, { type, payload }) {
	switch (type) {
		case 'NPC_HAPPINESS_CHANGE':
			return {
				...state,
				[payload.npc]: npc(state[payload.npc], {
					happiness: state[payload.npc].happiness + parseInt(payload.change, 10),
				}),
			};
		default:
			return (
				state || {
					engineer: npc(),
					alana: npc(),
				}
			);
	}
}

function events(state = {}, { type, payload }) {
	switch (type) {
		case 'EVENT_TRIGGER':
			return { ...state, [payload]: true };
		default:
			return state;
	}
}

function dialog(state = null, { type, payload }) {
	switch (type) {
		case 'DIALOG_TRIGGER':
			return payload;
		case 'DIALOG_HIDE':
			return null;
		default:
			return state;
	}
}

function systemName(state = 'Algol', { type, payload }) {
	switch (type) {
		case 'SYSTEM_CHANGE':
			return payload;
		default:
			return state;
	}
}

export default function reducer(state = {}, action) {
	const updated = {
		npcs: npcs(state.npcs, action),
		events: events(state.events, action),
		dialog: dialog(state.dialog, action),
		systemName: systemName(state.systemName, action),
	};
	debug(state, action, updated);
	return updated;
}
