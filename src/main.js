/* @format */

import { createGame, scaleGameToWindow, setBackgroundColor } from './hexi-wrapper';
import { adjustSpeed, adjustRotation, getNewRingRotation, isClockwise } from './math';
import { makeReducer, makeState } from './state';
import reducer from './state-reducer';
import {
	setUpButtonControls,
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
	createAndPlaceButton,
	setSpriteRotation,
	getSpriteRotation,
	getSpriteMover,
} from './sprites';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/gate.png',
	'assets/ship.png',
	'assets/ship-2.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/button-up.png',
	'assets/button-down.png',
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
	const { getPressingState, getSpeed, getControlMode } = state;
	const { changeSpeed, changePressingState, changeCurrentSystem } = actions;
	const pressing = getPressingState();

	if (pressing.up) {
		switch (getControlMode()) {
			case 'pilot':
				changeSpeed(adjustSpeed(getSpriteRotation(ship), getSpeed()));
				break;
			case 'jump':
				changeCurrentSystem('Betan');
				break;
			default:
			// noop
		}
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
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		button: createAndPlaceButton(game),
		pilotModeButton: createAndPlaceModeButton(game, 'pilot', 1),
		landModeButton: createAndPlaceModeButton(game, 'land', 2),
		jumpModeButton: createAndPlaceModeButton(game, 'jump', 3),
		modePointer: createAndPlaceModePointer(game),
	};
}

function setUpGameObjects(game, state, actions) {
	const sprites = initSprites(game);
	const { changePressingState, changeControlMode } = actions;
	const { getControlMode, getPressingState } = state;
	setUpButtonControls(game, sprites.button, changePressingState, getPressingState);
	setUpKeyboardControls(
		game,
		getControlMode,
		changePressingState,
		changeControlMode,
		getPressingState
	);
	setUpNavigationRingControls(
		game,
		sprites.ring,
		getControlMode,
		changePressingState,
		getPressingState
	);
	const moveSprites = getSpriteMover(game);

	game.state = () => renderGame(game, sprites, state, actions, moveSprites);
}

function initGame() {
	const [getState, handleAction] = makeReducer(reducer, {
		currentSystem: 'Algol',
		position: {
			x: 100,
			y: 100,
		},
	});
	const getCurrentSystem = () => getState().currentSystem;
	const changeCurrentSystem = system => handleAction({ type: 'CHANGE_SYSTEM', payload: system });
	const getSystemPosition = () => getState().position;
	const changeSystemPosition = ({ x, y }) =>
		handleAction({ type: 'CHANGE_SYSTEM_POSITION', payload: { x, y } });
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
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		changeSystemPosition,
	};
	const setupCallback = game => setUpGameObjects(game, state, actions);
	const game = createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
	scaleGameToWindow(game);
	setBackgroundColor(game, 0x000000);
	game.start();
}

initGame();
