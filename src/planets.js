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

export function getPlanetsInSystem() {
	return [
		makePlanet({
			name: 'Twist',
			description:
				'A trading post set up on a small moon. Plenty of bars on Twist. Bit of a rough crowd.',
			position: { x: 25, y: 75 },
			color: 'red',
			size: 40,
		}),
	];
}
