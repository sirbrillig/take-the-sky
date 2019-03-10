/* @format */

import { createGame, scaleGameToWindow, setBackgroundColor } from './hexi-wrapper';
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
	const { getPressingState, getSpeed, getControlMode, getChargeMeterAmount } = state;
	const {
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		setChargeMeterVisible,
		setChargeMeterAmount,
	} = actions;
	const pressing = getPressingState();

	setChargeMeterVisible(getControlMode() === 'land' || getChargeMeterAmount() > 1);

	if (pressing.up) {
		switch (getControlMode()) {
			case 'pilot':
				changeSpeed(adjustSpeed(getSpriteRotation(ship), getSpeed()));
				break;
			case 'land':
				if (getChargeMeterAmount() < 100) {
					setChargeMeterAmount(getChargeMeterAmount() + 1.0);
				}
				// 66% of the full bar width (164px) is approximately 108px, where the limitLine is.
				if (getChargeMeterAmount() > 66) {
					const isShipTouchingPlanet = sprites.planets.find(planet =>
						game.hitTestRectangle(ship, planet)
					);
					if (isShipTouchingPlanet) {
						changeSpeed({ x: 0, y: 0 });
					}
				}
				break;
			case 'jump':
				changeCurrentSystem('Betan');
				break;
			default:
			// noop
		}
	}

	if (!pressing.up && getChargeMeterAmount() > 1) {
		setChargeMeterAmount(getChargeMeterAmount() - 0.5);
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
	const [isChargeMeterVisible, setChargeMeterVisible] = makeState(false);
	const [getChargeMeterAmount, setChargeMeterAmount] = makeState(0);
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
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		changeSystemPosition,
		setChargeMeterVisible,
		setChargeMeterAmount,
	};
	const setupCallback = game => setUpGameObjects(game, state, actions);
	const game = createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
	scaleGameToWindow(game);
	setBackgroundColor(game, 0x000000);
	game.start();
}

initGame();
