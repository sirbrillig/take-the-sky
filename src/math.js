/* @format */

export function clampNumber(num, min, max) {
	num = num > max ? max : num;
	num = num < min ? min : num;
	return num;
}

export function addVectors(first, second) {
	return {
		x: first.x + second.x,
		y: first.y + second.y,
	};
}

export function getScreenPositionFromSpacePosition(positionInSpace, playerPositionInSpace) {
	return addVectors(positionInSpace, playerPositionInSpace);
}

export function areVectorsSame(first, second) {
	return first.x === second.x && first.y === second.y;
}

export function invertVector({ x, y }) {
	return { x: -x, y: -y };
}

export function multiplyVector({ x, y }, scalar) {
	return {
		x: x * scalar,
		y: y * scalar,
	};
}

export function clampVector({ x, y }, min = -3, max = 3) {
	return {
		x: clampNumber(x, min, max),
		y: clampNumber(y, min, max),
	};
}

export function adjustSpeedForRotation(
	rotation,
	speed,
	accelerationRate = 0.04,
	maxSpeed = 3,
	dragRate = 0
) {
	const modifiedAcceleration = accelerationRate - dragRate;
	const newSpeed = {
		x: clampNumber(speed.x + modifiedAcceleration * Math.cos(rotation), -maxSpeed, maxSpeed),
		y: clampNumber(speed.y + modifiedAcceleration * Math.sin(rotation), -maxSpeed, maxSpeed),
	};
	return areVectorsSame(newSpeed, speed) ? speed : newSpeed;
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

/**
 * Return a new angle in radians based on a turning direction
 *
 * Direction can be one of 'counterclockwise' (decrease radians) or 'clockwise' (increase radians).
 */
export function adjustRotationForDirection(rotation, direction, rotationRate = 0.06) {
	const adjustForNegative = angle => (angle < 0 ? angle + Math.PI * 2 : angle);
	const adjustForMax = angle => (angle > Math.PI * 2 ? angle - Math.PI * 2 : angle);
	switch (direction) {
		case 'counterclockwise':
			return adjustForNegative(rotation - rotationRate);
		case 'clockwise':
			return adjustForMax(rotation + rotationRate);
		default:
			throw new Error(`Unknown direction '${direction}' when trying to calculate rotation`);
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
	const radians = Math.atan2(
		s2.y + getCenter(s2, s2.height, 'y') - (s1.y + getCenter(s1, s1.height, 'y')),
		s2.x + getCenter(s2, s2.width, 'x') - (s1.x + getCenter(s1, s1.width, 'x'))
	);
	return radians;
	// return radians > 0 ? radians : radians + Math.PI;
}

export function getAngleBetweenVectors(v1, v2) {
	return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}

// From: https://gist.github.com/gordonbrander/2230317
export function makeUniqueId() {
	return `_${Math.random()
		.toString(36)
		.substr(2, 9)}`;
}
