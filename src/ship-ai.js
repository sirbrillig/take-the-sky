/* @format */

import { adjustRotationForDirection, getAngleBetweenVectors, adjustSpeedForRotation } from './math';
import { getEvent, getShipDataForId, getMovingObjectForId } from './selectors';
import { createBolt } from './other-ships';
import debugFactory from './debug';

const debug = debugFactory('sky:ai');

export default class ShipAi {
	constructor({
		game,
		getState,
		showDialog,
		handleAction,
		shipId,
		movingObjectId,
		playerVector,
		shipVector,
		changeRotationCallback,
		rotation,
		speed,
		changeSpeedCallback,
		minFireMs = 1200,
		fireDistance = 150,
		maxDistance = 1000,
		rotationRate = 0.03,
		minRotationRate = 0.02,
		accelerationRate = 0.05,
		maxSpeed = 3.5,
	}) {
		this.game = game;
		this.getState = getState;
		this.shipId = shipId;
		this.movingObjectId = movingObjectId;
		this.showDialog = showDialog; // showDialog is assigned in directly
		this.handleAction = handleAction;
		this.fireDistance = fireDistance;
		this.minFireMs = minFireMs;
		this.maxDistance = maxDistance;
		this.playerVector = playerVector;
		this.shipVector = shipVector;
		this.rotationRate = rotationRate;
		this.minRotationRate = minRotationRate;
		this.changeRotationCallback = changeRotationCallback;
		this.rotation = rotation;
		this.speed = speed;
		this.accelerationRate = accelerationRate;
		this.maxSpeed = maxSpeed;
		this.changeSpeedCallback = changeSpeedCallback;
	}

	distanceToPlayer() {
		return this.playerVector.sub(this.shipVector).magnitude();
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
		const radiansNeededToRotate = this.getRadiansNeededToRotateTowardPlayer();
		const radiansToRotate =
			Math.abs(radiansNeededToRotate) < this.rotationRate
				? radiansNeededToRotate
				: this.rotationRate;
		debug('radians to player', radiansNeededToRotate, 'radians to rotate', radiansToRotate);
		if (radiansToRotate < this.minRotationRate) {
			return;
		}
		this.changeRotationCallback(
			adjustRotationForDirection(
				this.rotation,
				this.getRotationDirection(radiansNeededToRotate),
				radiansToRotate
			)
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

	// eslint-disable-next-line class-methods-use-this
	getRotationDirection(radiansNeededToRotate) {
		return radiansNeededToRotate < 0 ? 'clockwise' : 'counterclockwise';
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

	hasFiredRecently() {
		const shipData = getShipDataForId(this.getState(), this.shipId);
		if (!shipData) {
			throw new Error(`Could not find ship id ${this.shipId} when checking for recent firing`);
		}
		if (!shipData.lastFireTime) {
			return false;
		}
		debug(`last fired at ${shipData.lastFireTime}`);
		const now = Date.now();
		const timeSinceFire = now - shipData.lastFireTime;
		return timeSinceFire < this.minFireMs;
	}

	getAgeInMs() {
		const shipData = getMovingObjectForId(this.getState(), this.movingObjectId);
		if (!shipData) {
			throw new Error(`Could not find ship id ${this.shipId} when getting creation date`);
		}
		const now = Date.now();
		return now - shipData.createdAt;
	}

	destroy() {
		debug('destroying object');
		const shipData = getMovingObjectForId(this.getState(), this.movingObjectId);
		this.handleAction({
			type: 'MOVING_OBJECT_UPDATE',
			payload: { ...shipData, deleted: true },
		});
	}

	fire() {
		if (this.hasFiredRecently()) {
			debug('fire canceled; has fired recently');
			return;
		}
		const shipData = getShipDataForId(this.getState(), this.shipId);
		if (!shipData) {
			throw new Error(`Could not find ship id ${this.shipId} when updating firing date`);
		}
		const payload = { ...shipData, lastFireTime: Date.now() };
		this.handleAction({ type: 'CHANGE_OTHER_SHIP_DATA', payload });
		debug(`firing at ${payload.lastFireTime}`);
		const behavior = [
			{
				type: 'functionCall',
				functionName: 'if',
				args: [
					{
						type: 'comparison',
						leftSide: {
							type: 'functionCall',
							functionName: 'getAgeInMs',
							args: [],
						},
						rightSide: {
							type: 'number',
							value: 5000,
						},
						comparator: {
							type: 'comparator',
							value: '>',
						},
					},
					{
						type: 'block',
						value: [
							{
								type: 'functionCall',
								functionName: 'destroy',
								args: [],
							},
						],
					},
				],
			},
			{
				type: 'functionCall',
				functionName: 'accelerate',
				args: [],
			},
		];
		this.handleAction({
			type: 'MOVING_OBJECT_CREATE',
			payload: createBolt(this.rotation, shipData.positionInSpace, behavior),
		});
	}
}
