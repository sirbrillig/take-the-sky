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
		showDialog,
	} = actions;
	const pressing = getPressingState();

	if (isDialogVisible()) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return; // freeze the game if the dialog is showing
	}
	showDialog('firstLanding1'); // FIXME: just for testing
	return; // FIXME: just for testing

	setChargeMeterVisible(getControlMode() === 'land' || getChargeMeterAmount() > 1);

	const isShipTouchingStar =
		sprites.stars && sprites.stars.find(star => doSpritesOverlap(ship, star));
	if (isShipTouchingStar && getHealthAmount() > 0) {
		setHealthAmount(getHealthAmount() - 1);
	}

	if (getHealthAmount() < 1) {
		showDialog('explodedShip');
		return;
	}

	if (getControlMode() === 'land' && isChargeMeterFull(getChargeMeterAmount())) {
		const isShipTouchingPlanet =
			sprites.planets && sprites.planets.find(planet => doSpritesOverlap(ship, planet));
		if (isShipTouchingPlanet) {
			setChargeMeterAmount(0);
			changeSpeed({ x: 0, y: 0 });
			showDialog('firstLanding1');
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
				showDialog('firstLandingNotDone');
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

	moveSprites(sprites, state, actions);
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
			gameOver: false,
		},
	});
	const getCurrentSystem = () => getState().currentSystem;
	const changeCurrentSystem = system => handleAction({ type: 'CHANGE_SYSTEM', payload: system });
	const getSystemPosition = () => getState().position;
	const changeSystemPosition = ({ x, y }) =>
		handleAction({ type: 'CHANGE_SYSTEM_POSITION', payload: { x, y } });
	const getEvent = key => getState().events[key];
	const [getDialog, showDialog] = makeState(null);
	const [getDialogSelection, changeDialogSelection] = makeState(0);
	const isDialogVisible = () => !!getDialog();
	const dialogSelect = () => showDialog(null); // TODO: set dialog to link of current selection or hide dialog if no link
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
		getDialog,
		getDialogSelection,
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
		handleAction,
		showDialog,
		dialogSelect,
		changeDialogSelection,
	};
	const setupCallback = game => {
		const sprites = setUpGameObjects(game, state, actions);
		const moveSprites = getSpriteMover(game);
		game.ticker.add(() => renderGame(game, sprites, state, actions, moveSprites));
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
