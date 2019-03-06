/* @format */

export function makePlanet({ name, description, position, color, size }) {
	return {
		name,
		description,
		position,
		color,
		size,
	};
}

export function getAllSystems() {
	return {
		Algol: {
			star: {
				position: { x: 100, y: 300 },
				size: 200,
				color: 'yellow',
			},
			gates: [
				{
					position: { x: 600, y: 600 },
				},
			],
			planets: [
				{
					name: 'Twist',
					description:
						'A trading post set up on a small moon. Plenty of bars on Twist. Bit of a rough crowd.',
					position: { x: 25, y: 75 },
					color: 'red',
					size: 40,
				},
			],
		},
		Betan: {
			star: {
				position: { x: 100, y: 400 },
				size: 150,
				color: 'orange',
			},
			planets: [
				{
					name: 'Beta',
					description:
						'Home to many researchers and medical professionals. Expensive tech. Folks are overworked, mostly.',
					position: { x: 80, y: 200 },
					color: 'blue',
					size: 40,
				},
			],
		},
	};
}

export function getPlanetsInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system ? system.planets : [];
}

export function getStarsInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system ? [system.star] : [];
}

export function getGatesInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system ? system.gates : [];
}
