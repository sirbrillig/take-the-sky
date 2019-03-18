/* @format */

import { getShips } from './selectors';
import { makeUniqueId } from './math';

export function getOtherShipsToCreate(shipSprites, state) {
	const existingShipIds = shipSprites.map(sprite => sprite.shipId);
	return getShips(state).filter(
		shipData => !existingShipIds.find(shipId => shipId === shipData.shipId)
	);
}

export function makeShipData(shipType) {
	switch (shipType) {
		case 'cruiser':
			return {
				shipType,
				shipId: makeUniqueId(),
				behavior: 'follow',
				position: { x: 0, y: 0 },
				speed: { x: 0, y: 0 },
			};
		default:
			throw new Error(`Unknown ship type ${shipType}`);
	}
}

export function getShipSpriteForType(shipType) {
	switch (shipType) {
		case 'cruiser':
			return 'assets/ship-2.png';
		default:
			throw new Error(`Unknown ship type ${shipType}`);
	}
}
