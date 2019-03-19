/* @format */

export function getNpc(state, key) {
	return state.npcs[key];
}

export function getNpcHappiness(state, key) {
	const npc = getNpc(state, key) || { happiness: 0 };
	return npc.happiness;
}

export function getEvent(state, key) {
	return state.events[key];
}

export function getCurrentSystem(state) {
	return state.currentSystem;
}

export function getPlayerPosition(state) {
	return state.playerPosition;
}

export function getHealthAmount(state) {
	return state.shipHealth;
}

export function getShips(state) {
	return state.otherShips;
}

export function getShipDataForId(state, id) {
	return getShips(state).find(ship => ship.shipId === id);
}
