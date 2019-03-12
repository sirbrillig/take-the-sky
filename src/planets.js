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
				position: { x: 800, y: 300 },
				size: 200,
				color: 0xffff00,
			},
			gates: [
				{
					position: { x: 2000, y: 2000 },
				},
			],
			planets: [
				{
					name: 'Twist',
					description:
						"Not much of a tourist destination. Or any kind of destination at all, really. The Empire tout it as a settler's paradise. Mostly it's just a lot of mud.",
					position: { x: 25, y: 75 },
					color: 0xff0000,
					size: 40,
				},
			],
		},
		Betan: {
			star: {
				position: { x: 100, y: 400 },
				size: 150,
				color: 0xffa500,
			},
			planets: [
				{
					name: 'Beta',
					description:
						'Home to many researchers and medical professionals. Expensive tech. Folks are overworked, mostly.',
					position: { x: 80, y: 200 },
					color: 0x0000ff,
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

export function getGatesInSystem(systemName) {
	const system = getAllSystems()[systemName];
	return system && system.gates ? system.gates : [];
}
