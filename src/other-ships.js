/* @format */

import { getShips, getMovingObjects } from './selectors';
import { makeUniqueId } from './math';

export function getOtherShipsToCreate(shipSprites, state) {
	const existingShipIds = shipSprites.map(sprite => sprite.shipId);
	return getShips(state).filter(shipData => !existingShipIds.includes(shipData.shipId));
}

export function getMovingObjectsToCreate(sprites, state, idProperty) {
	const existingIds = sprites.map(sprite => sprite[idProperty]);
	return getMovingObjects(state).filter(objData => !existingIds.includes(objData[idProperty]));
}

export function makeShipData(shipType, shipId, behavior) {
	switch (shipType) {
		case 'cruiser':
			return {
				shipType,
				shipId: shipId || makeUniqueId(),
				behavior,
				positionInSpace: { x: -250, y: -250 },
				speed: { x: 0, y: 0 },
			};
		default:
			throw new Error(`Unknown ship type ${shipType}`);
	}
}

export function getShipSpriteForType(shipType) {
	switch (shipType) {
		case 'cruiser':
			return 'assets/cruiser.png';
		default:
			throw new Error(`Unknown ship type ${shipType}`);
	}
}

export function getMovingObjectSpriteForType(type) {
	switch (type) {
		case 'bolt':
			return 'assets/bolt-red.png';
		default:
			throw new Error(`Unknown moving object type ${type}`);
	}
}

export function createBolt(rotation, positionInSpace, behavior) {
	return {
		type: 'bolt',
		movingObjectId: makeUniqueId(),
		rotation,
		positionInSpace,
		behavior,
		maxSpeed: 5,
		accelerationRate: 1,
		speed: { x: 0, y: 0 },
	};
}
