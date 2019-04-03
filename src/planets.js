/* @format */

export function getAllSystems() {
	return {
		Algol: {
			star: {
				position: { x: 900, y: 400 },
				size: 500,
			},
			planets: [
				{
					name: 'Twist',
					position: { x: 25, y: 75 },
					size: 100,
				},
			],
		},
		Betan: {
			star: {
				position: { x: 100, y: 400 },
				size: 300,
			},
			planets: [
				{
					name: 'Beta',
					position: { x: 80, y: 200 },
					size: 40,
				},
			],
		},
	};
}

export function getPlanetsInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system && system.planets ? system.planets : [];
}

export function getStarsInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system && system.star ? [system.star] : [];
}
