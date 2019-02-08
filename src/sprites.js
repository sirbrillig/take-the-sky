/* @format */
const accelerationRate = 0.1;
const maxAcceleration = 3;
const rotationRate = 0.1;

export function adjustSpeed(pressing, rotation, speed) {
	let { x, y } = speed;
	if (pressing.up) {
		y += accelerationRate * Math.sin(rotation);
		x += accelerationRate * Math.cos(rotation);
	}
	y = y > maxAcceleration ? maxAcceleration : y;
	x = x > maxAcceleration ? maxAcceleration : x;
	// TODO: handle negative max speed
	return { x, y };
}

export function adjustRotation(pressing, rotation) {
	if (pressing.left) {
		rotation -= rotationRate;
	}
	if (pressing.right) {
		rotation += rotationRate;
	}
	return rotation;
}
