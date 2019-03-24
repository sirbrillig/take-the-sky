/* @format */

import { getShips } from './selectors';
import { makeUniqueId } from './math';

export function getOtherShipsToCreate(shipSprites, state) {
	const existingShipIds = shipSprites.map(sprite => sprite.shipId);
	return getShips(state).filter(shipData => !existingShipIds.includes(shipData.shipId));
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
