/* @format */

import createGame from './pixi-wrapper';
import { adjustSpeed, adjustRotation, getNewRingRotation, isClockwise } from './math';
import { makeReducer, makeState } from './state';
import reducer from './state-reducer';
import {
	setUpKeyboardControls,
	setUpNavigationRingControls,
	getTurningDirectionFromPressingState,
} from './controls';
import {
	getCurrentCoordinates,
	createAndPlaceModeButton,
	createAndPlaceModePointer,
	createAndPlaceBackground,
	createAndPlaceShip,
	createAndPlaceNavigationRing,
	createAndPlaceDialog,
	setSpriteRotation,
	getSpriteRotation,
	getSpriteMover,
	doSpritesOverlap,
	isChargeMeterFull,
} from './sprites';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/gate.png',
	'assets/ship.png',
	'assets/ship-2.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/pointer.png',
];

function updateStateFromPressingState(state, actions) {
	const { getSpeed, getSystemPosition } = state;
	const { changeSystemPosition } = actions;
	const speed = getSpeed();
	const system = getSystemPosition();
	changeSystemPosition({ x: system.x + speed.x, y: system.y + speed.y });
}

function renderGame(game, sprites, state, actions, moveSprites) {
	const { ship, ring } = sprites;
	const {
		getPressingState,
		getSpeed,
		getControlMode,
		getChargeMeterAmount,
		getHealthAmount,
		getEvent,
		isDialogVisible,
	} = state;
	const {
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		setChargeMeterVisible,
		setChargeMeterAmount,
		setHealthAmount,
		markFirstLanding,
		setDialogArray,
	} = actions;
	const pressing = getPressingState();

	if (isDialogVisible()) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state);
		return; // freeze the game if the dialog is showing
	}

	setChargeMeterVisible(getControlMode() === 'land' || getChargeMeterAmount() > 1);

	const isShipTouchingStar =
		sprites.stars && sprites.stars.find(star => doSpritesOverlap(ship, star));
	if (isShipTouchingStar && getHealthAmount() > 1) {
		setHealthAmount(getHealthAmount() - 1);
	}

	if (getControlMode() === 'land' && isChargeMeterFull(getChargeMeterAmount())) {
		const isShipTouchingPlanet =
			sprites.planets && sprites.planets.find(planet => doSpritesOverlap(ship, planet));
		if (isShipTouchingPlanet) {
			setChargeMeterAmount(0);
			changeSpeed({ x: 0, y: 0 });
			markFirstLanding();
			setDialogArray([
				"In the dingy space port, you are approached by a teenage girl. She's very confident, but always looking over her shoulder. You don't see anyone other than a drunk and a traffic controller nearby, but on this tiny planet you wouldn't be surprised if someone meant this woman harm.",
				"Girl: You're a captain, right? I'm the one who sent the message. I... I want to buy passage. Passage ... just passage out of here. Please?",
			]);
		}
	}

	if (getControlMode() === 'jump' && isChargeMeterFull(getChargeMeterAmount())) {
		const isShipTouchingGate =
			sprites.gates && sprites.gates.find(gate => doSpritesOverlap(ship, gate));
		if (isShipTouchingGate) {
			setChargeMeterAmount(0);
			if (getEvent('firstLanding')) {
				changeCurrentSystem('Betan');
			} else {
				setDialogArray([
					"Engineer: Captain, we came to this backwater planet because there's a job to be had. Let's not leave before we at least hear them out.",
				]);
			}
		}
	}

	if (pressing.up) {
		switch (getControlMode()) {
			case 'pilot':
				changeSpeed(adjustSpeed(getSpriteRotation(ship), getSpeed()));
				break;
			case 'land':
				if (getChargeMeterAmount() < 100) {
					setChargeMeterAmount(getChargeMeterAmount() + 1.0);
				}
				break;
			case 'jump':
				if (getChargeMeterAmount() < 100) {
					setChargeMeterAmount(getChargeMeterAmount() + 1.0);
				}
				break;
			default:
			// noop
		}
	}

	if (!pressing.up && getChargeMeterAmount() > 1) {
		setChargeMeterAmount(getChargeMeterAmount() - 0.2);
	}
	if (
		pressing.up &&
		getControlMode() !== 'land' &&
		getControlMode() !== 'jump' &&
		getChargeMeterAmount() > 1
	) {
		setChargeMeterAmount(getChargeMeterAmount() - 0.2);
	}

	if (getControlMode() === 'pilot' && (pressing.left || pressing.right)) {
		setSpriteRotation(
			ship,
			adjustRotation(getTurningDirectionFromPressingState(pressing), getSpriteRotation(ship))
		);
	}

	if (getControlMode() === 'pilot' && pressing.ring) {
		const currentCoordinates = getCurrentCoordinates(game);
		const newRingRotation = isClockwise(ring, pressing.ring, currentCoordinates)
			? getNewRingRotation(ring, pressing.ring, currentCoordinates)
			: -getNewRingRotation(ring, pressing.ring, currentCoordinates);
		setSpriteRotation(ship, getSpriteRotation(ship) + newRingRotation);
		changePressingState({ ...pressing, ring: currentCoordinates });
	}
	setSpriteRotation(ring, getSpriteRotation(ship));

	updateStateFromPressingState(state, actions);

	moveSprites(sprites, state);
}

function initSprites(game) {
	return {
		sky: createAndPlaceBackground(game),
		dialog: createAndPlaceDialog(game),
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		pilotModeButton: createAndPlaceModeButton(game, 'pilot', 1),
		landModeButton: createAndPlaceModeButton(game, 'land', 2),
		jumpModeButton: createAndPlaceModeButton(game, 'jump', 3),
		modePointer: createAndPlaceModePointer(game),
	};
}

function setUpGameObjects(game, state, actions) {
	const sprites = initSprites(game);
	const { changePressingState } = actions;
	const { getControlMode, getPressingState } = state;
	setUpKeyboardControls(game, state, actions);
	setUpNavigationRingControls(
		game,
		sprites.ring,
		getControlMode,
		changePressingState,
		getPressingState
	);
	return sprites;
}

function initGame() {
	const [getState, handleAction] = makeReducer(reducer, {
		currentSystem: 'Algol',
		position: {
			x: 100,
			y: 100,
		},
		events: {
			firstLanding: false,
		},
	});
	const getCurrentSystem = () => getState().currentSystem;
	const changeCurrentSystem = system => handleAction({ type: 'CHANGE_SYSTEM', payload: system });
	const getSystemPosition = () => getState().position;
	const changeSystemPosition = ({ x, y }) =>
		handleAction({ type: 'CHANGE_SYSTEM_POSITION', payload: { x, y } });
	const markFirstLanding = () => handleAction({ type: 'EVENT_FIRST_LANDING' });
	const getEvent = key => getState().events[key];
	const [getDialogText, setDialogArray] = makeState([]);
	const isDialogVisible = () => !!getDialogText().length;
	const hideDialog = () => setDialogArray(getDialogText().slice(1));
	const [isChargeMeterVisible, setChargeMeterVisible] = makeState(false);
	const [getChargeMeterAmount, setChargeMeterAmount] = makeState(0);
	const [getHealthAmount, setHealthAmount] = makeState(100);
	const [getSpeed, changeSpeed] = makeState({ x: 0, y: 0 });
	const [getPressingState, changePressingState] = makeState({
		up: false,
		down: false,
		left: false,
		right: false,
		ring: false,
	});
	const [getControlMode, changeControlMode] = makeState('pilot');
	const state = {
		getControlMode,
		getPressingState,
		getSpeed,
		getCurrentSystem,
		getSystemPosition,
		isChargeMeterVisible,
		getChargeMeterAmount,
		getHealthAmount,
		getEvent,
		isDialogVisible,
		getDialogText,
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		changeSystemPosition,
		setChargeMeterVisible,
		setChargeMeterAmount,
		setHealthAmount,
		markFirstLanding,
		setDialogArray,
		hideDialog,
	};
	const setupCallback = game => {
		const sprites = setUpGameObjects(game, state, actions);
		const moveSprites = getSpriteMover(game);
		game.ticker.add(() => renderGame(game, sprites, state, actions, moveSprites));
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
