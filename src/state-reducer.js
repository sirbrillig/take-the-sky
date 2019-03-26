/* @format */

import debugFactory from './debug';
import { clampNumber } from './math';

const debug = debugFactory('sky:state');

function npc(state = { happiness: 0 }, action = {}) {
	return { happiness: state.happiness + action.happiness || 0 };
}

function npcs(state, { type, payload }) {
	switch (type) {
		case 'EVENT_FIRST_LANDING_NOT_DONE':
			return { ...state, engineer: npc(state.engineer, { happiness: -1 }) };
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
		case 'EVENT_FIRST_LANDING':
			return { ...state, firstLanding: true };
		case 'EVENT_GAME_OVER':
			return { ...state, gameOver: true };
		case 'EVENT_TRIGGER':
			return { ...state, [payload]: true };
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

// canvas is 800x600, so 400x300 is in the middle
function playerPosition(state = { x: 400, y: 300 }, { type, payload }) {
	switch (type) {
		case 'CHANGE_PLAYER_POSITION':
			return payload;
		default:
			return state;
	}
}

function shipHealth(state = 100, { type, payload }) {
	switch (type) {
		case 'HEALTH_CHANGE':
			return clampNumber(payload, 0, 100);
		default:
			return state;
	}
}

function updateObjectInArray(dataArray, objData, idProperty) {
	const matchingData = dataArray.find(other => other[idProperty] === objData[idProperty]);
	if (!matchingData) {
		throw new Error(
			`Object data not found when trying to change data for ${idProperty} "${objData[idProperty]}"`
		);
	}
	const dataArrayWithDataRemoved = dataArray.filter(
		other => other[idProperty] !== objData[idProperty]
	);
	return [...dataArrayWithDataRemoved, { ...matchingData, ...objData }];
}

function removeObjectFromArray(dataArray, objData, idProperty) {
	const matchingData = dataArray.find(other => other[idProperty] === objData[idProperty]);
	if (!matchingData) {
		throw new Error(
			`Object data not found when trying to remove data for ${idProperty} "${objData[idProperty]}"`
		);
	}
	const dataArrayWithDataRemoved = dataArray.filter(
		other => other[idProperty] !== objData[idProperty]
	);
	return dataArrayWithDataRemoved;
}

function throwIfNotUnique(objects, newObject, idProperty) {
	objects.forEach(obj => {
		if (obj[idProperty] === newObject[idProperty]) {
			throw new Error(`Object with ${idProperty} "${newObject[idProperty]}" already exists."`);
		}
	});
}

function otherShips(state = [], { type, payload }) {
	switch (type) {
		case 'OTHER_SHIP_ADD':
			throwIfNotUnique(state, payload, 'shipId');
			return [...state, { ...payload, createdAt: Date.now() }];
		case 'CHANGE_OTHER_SHIP_DATA':
			return updateObjectInArray(state, payload, 'shipId');
		default:
			return state;
	}
}

function movingObjects(state = [], { type, payload }) {
	switch (type) {
		case 'MOVING_OBJECT_CREATE':
			throwIfNotUnique(state, payload, 'movingObjectId');
			return [...state, { ...payload, createdAt: Date.now() }];
		case 'MOVING_OBJECT_UPDATE':
			return updateObjectInArray(state, payload, 'movingObjectId');
		case 'MOVING_OBJECT_DESTROY':
			return removeObjectFromArray(state, payload, 'movingObjectId');
		default:
			return state;
	}
}

export default function reducer(state = {}, action) {
	const updated = {
		npcs: npcs(state.npcs, action),
		events: events(state.events, action),
		playerPosition: playerPosition(state.playerPosition, action),
		currentSystem: currentSystem(state.currentSystem, action),
		shipHealth: shipHealth(state.shipHealth, action),
		otherShips: otherShips(state.otherShips, action),
		movingObjects: movingObjects(state.movingObjects, action),
	};
	debug(state, action, updated);
	return updated;
}
