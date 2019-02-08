/* @format */
const accelerationRate = 0.1;
const maxSpeed = 3;
const rotationRate = 0.1;

export function adjustSpeed(pressing, rotation, speed) {
	let { x, y } = speed;
	if (pressing.up) {
		y += accelerationRate * Math.sin(rotation);
		x += accelerationRate * Math.cos(rotation);
	}
	y = y > maxSpeed ? maxSpeed : y;
	x = x > maxSpeed ? maxSpeed : x;
	y = y < -maxSpeed ? -maxSpeed : y;
	x = x < -maxSpeed ? -maxSpeed : x;
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
