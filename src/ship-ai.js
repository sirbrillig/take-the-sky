/* @format */

import { adjustRotationForDirection, getAngleBetweenVectors, adjustSpeedForRotation } from './math';
import { getEvent } from './selectors';

export default class ShipAi {
	constructor({
		game,
		getState,
		showDialog,
		handleAction,
		playerVector,
		shipVector,
		changeRotationCallback,
		rotation,
		speed,
		changeSpeedCallback,
		fireDistance = 150,
		maxDistance = 1000,
		rotationRate = 0.03,
		accelerationRate = 0.05,
		maxSpeed = 3.5,
	}) {
		this.game = game;
		this.getState = getState;
		this.showDialog = showDialog;
		this.handleAction = handleAction;
		this.fireDistance = fireDistance;
		this.maxDistance = maxDistance;
		this.playerVector = playerVector;
		this.shipVector = shipVector;
		this.rotationRate = rotationRate;
		this.changeRotationCallback = changeRotationCallback;
		this.rotation = rotation;
		this.speed = speed;
		this.accelerationRate = accelerationRate;
		this.maxSpeed = maxSpeed;
		this.changeSpeedCallback = changeSpeedCallback;
	}

	isPlayerWithinAttackRange() {
		const distance = this.playerVector.sub(this.shipVector).magnitude();
		return distance < this.fireDistance;
	}

	isPlayerWithinApproachRange() {
		const distance = this.playerVector.sub(this.shipVector).magnitude();
		return distance < this.maxDistance;
	}

	isShipFacingPlayer() {
		return Math.abs(this.getRadiansNeededToRotateTowardPlayer()) < 0.1;
	}

	rotateTowardPlayer() {
		this.changeRotationCallback(
			adjustRotationForDirection(this.rotation, this.getRotationDirection(), this.rotationRate)
		);
	}

	getRadiansNeededToRotateTowardPlayer() {
		const targetAngleCounterclockwise = getAngleBetweenVectors(this.playerVector, this.shipVector);
		const targetAngleClockwise = 2 * Math.PI + targetAngleCounterclockwise;
		// sprite rotation (this.rotation) is clockwise
		const radiansNeededToRotateClockwise = this.rotation - targetAngleClockwise;
		const radiansNeededToRotateCounterclockwise = radiansNeededToRotateClockwise + 2 * Math.PI;
		return Math.abs(radiansNeededToRotateClockwise) <
			Math.abs(radiansNeededToRotateCounterclockwise)
			? radiansNeededToRotateClockwise
			: radiansNeededToRotateCounterclockwise;
	}

	getRotationDirection() {
		return this.getRadiansNeededToRotateTowardPlayer() < 0 ? 'clockwise' : 'counterclockwise';
	}

	decelerate() {
		const drag = this.accelerationRate * 1.5;
		this.changeSpeedCallback(
			adjustSpeedForRotation(this.rotation, this.speed, 0, this.maxSpeed, drag)
		);
	}

	accelerate() {
		this.changeSpeedCallback(
			adjustSpeedForRotation(this.rotation, this.speed, this.accelerationRate, this.maxSpeed)
		);
	}

	triggerEvent(key) {
		this.handleAction({ type: 'EVENT_TRIGGER', payload: key });
	}

	isEventComplete(key) {
		return getEvent(this.getState(), key);
	}
}
