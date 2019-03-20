/* @format */

export function adjustNumberBetween(num, min, max) {
	num = num > max ? max : num;
	num = num < min ? min : num;
	return num;
}

export function getScreenPositionFromSpacePosition(positionInSpace, playerPositionInSpace) {
	return {
		x: positionInSpace.x + playerPositionInSpace.x,
		y: positionInSpace.y + playerPositionInSpace.y,
	};
}

export function areVectorsSame(first, second) {
	return first.x === second.x && first.y === second.y;
}

export function adjustSpeedForMax(speed, maxSpeed = 3) {
	return {
		x: adjustNumberBetween(speed.x, -maxSpeed, maxSpeed),
		y: adjustNumberBetween(speed.y, -maxSpeed, maxSpeed),
	};
}

export function adjustSpeedForRotation(rotation, speed, accelerationRate = 0.04, maxSpeed = 3) {
	let { x, y } = speed;
	y += accelerationRate * Math.sin(rotation);
	x += accelerationRate * Math.cos(rotation);
	y = adjustNumberBetween(y, -maxSpeed, maxSpeed);
	x = adjustNumberBetween(x, -maxSpeed, maxSpeed);
	return areVectorsSame({ x, y }, speed) ? speed : { x, y };
}

// From: https://github.com/kittykatattack/gameUtilities/blob/4b496be24b656c36b8932d9ee44146cd92e612e9/src/gameUtilities.js#L126
export function getCenter(o, dimension, axis) {
	if (o.anchor !== undefined) {
		if (o.anchor[axis] !== 0) {
			return 0;
		}
		return dimension / 2;
	}
	return dimension;
}

// From: https://github.com/kittykatattack/gameUtilities/blob/4b496be24b656c36b8932d9ee44146cd92e612e9/src/gameUtilities.js#L74
// Adapted for x and y speeds.
export function adjustSpeedToFollow(follower, leader, speed) {
	// Figure out the distance between the sprites
	const vx = leader.x - follower.x;
	const vy = leader.y - follower.y;
	const distance = Math.sqrt(vx * vx + vy * vy);

	if (distance >= speed.x + speed.y) {
		return {
			x: follower.x + (vx / distance) * Math.abs(speed.x),
			y: follower.y + (vy / distance) * Math.abs(speed.y),
		};
	}
	return {
		x: 0,
		y: 0,
	};
}

export function adjustRotation(direction, rotation) {
	const rotationRate = 0.1;
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

export function isClockwise(center, start, end) {
	// From: https://gamedev.stackexchange.com/questions/22133/how-to-detect-if-object-is-moving-in-clockwise-or-counterclockwise-direction
	return (start.x - center.x) * (end.y - center.y) - (start.y - center.y) * (end.x - center.x) > 0;
}

export function getAngleBetweenSprites(s1, s2) {
	// From: https://github.com/kittykatattack/gameUtilities/blob/4b496be24b656c36b8932d9ee44146cd92e612e9/src/gameUtilities.js#L103
	// Returns angle in radians from the 0 position of s1 (pointing left)
	return Math.atan2(
		s2.y + getCenter(s2, s2.height, 'y') - (s1.y + getCenter(s1, s1.height, 'y')),
		s2.x + getCenter(s2, s2.width, 'x') - (s1.x + getCenter(s1, s1.width, 'x'))
	);
}

// From: https://gist.github.com/gordonbrander/2230317
export function makeUniqueId() {
	return `_${Math.random()
		.toString(36)
		.substr(2, 9)}`;
}
