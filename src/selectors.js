/* @format */

export function getNpc(state, key) {
	return state.npcs[key];
}

export function getNpcHappiness(state, key) {
	const npc = getNpc(state, key) || { happiness: 0 };
	return npc.happiness;
}
