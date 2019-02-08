const accelerationRate = 0.1;
const maxAcceleration = 3;
const rotationRate = 0.1;

export function adjustSpeed(pressing, rotation, speed) {
	if (pressing.up) {
		speed.y += accelerationRate * Math.sin(rotation);
		speed.x += accelerationRate * Math.cos(rotation);
	}
	if (speed.y > maxAcceleration) {
		speed.y = maxAcceleration;
	}
	if (speed.x > maxAcceleration) {
		speed.x = maxAcceleration;
	}
	// TODO: handle negative max speed
	return speed;
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
