/* @format */
const accelerationRate = 0.1;
const maxSpeed = 3;
const rotationRate = 0.1;

export function adjustSpeed(isAccelerating, rotation, speed) {
	let { x, y } = speed;
	if (isAccelerating) {
		y += accelerationRate * Math.sin(rotation);
		x += accelerationRate * Math.cos(rotation);
	}
	y = y > maxSpeed ? maxSpeed : y;
	x = x > maxSpeed ? maxSpeed : x;
	y = y < -maxSpeed ? -maxSpeed : y;
	x = x < -maxSpeed ? -maxSpeed : x;
	if (x === speed.x && y === speed.y) {
		return speed;
	}
	return { x, y };
}

export function adjustRotation(direction, rotation) {
	switch (direction) {
		case 'left':
			return rotation - rotationRate;
		case 'right':
			return rotation + rotationRate;
		default:
			return rotation;
	}
}

export function getNewRingRotation(ring, start, end) {
	// From: https://gist.github.com/Samueleroux/f6854e8e443a210ff6958b23f2237097
	const p1 = {
		x: ring.x,
		y: ring.y,
	};

	const p2 = {
		x: start.x,
		y: start.y,
	};

	const p3 = {
		x: end.x,
		y: end.y,
	};

	const p12 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	const p13 = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
	const p23 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));

	const resultRadian = Math.acos(
		(Math.pow(p12, 2) + Math.pow(p13, 2) - Math.pow(p23, 2)) / (2 * p12 * p13)
	);

	return resultRadian;
}
