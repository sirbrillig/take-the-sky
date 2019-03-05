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
	};
}

export function getPlanetsInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system ? system.planets : [];
}
