/* @format */
/* globals hexi */

import { adjustSpeed, adjustRotation, getNewRingRotation } from './math';
import makeState from './state';
import {
	setUpButtonControls,
	setUpKeyboardControls,
	setUpNavigationRingControls,
	getTurningDirectionFromPressingState,
} from './controls';
import {
	getCurrentCoordinates,
	getModePointerPositionForMode,
	createAndPlaceModeButton,
	createAndPlaceModePointer,
	createAndPlaceBackground,
	createAndPlacePlanets,
	createAndPlaceShip,
	createAndPlaceNavigationRing,
	createAndPlaceButton,
} from './sprites';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/ship.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/button-up.png',
	'assets/button-down.png',
	'assets/pointer.png',
];

function renderGame(game, sprites, state, actions) {
	const { ship, system, ring, sky, modePointer } = sprites;
	const { getPressingState, getSpeed, getControlMode } = state;
	const { changeSpeed, changePressingState } = actions;
	const pressing = getPressingState();
	changeSpeed(adjustSpeed(pressing.up, ship.rotation, getSpeed()));
	ship.rotation = adjustRotation(getTurningDirectionFromPressingState(pressing), ship.rotation);
	if (pressing.ring) {
		const currentCoordinates = getCurrentCoordinates(game);
		// TODO: this goes in reverse on the right side of the ring
		ship.rotation += getNewRingRotation(ring, pressing.ring, currentCoordinates);
		changePressingState({ ring: currentCoordinates });
	}
	ring.rotation = ship.rotation;
	const speed = getSpeed();
	system.vy = speed.y;
	system.vx = speed.x;
	sky.tileX += speed.x;
	sky.tileY += speed.y;
	ring.visible = getControlMode().mode === 'pilot';
	modePointer.y = getModePointerPositionForMode(getControlMode().mode);
	game.move(Object.values(sprites));
}

function initSprites(game) {
	return {
		sky: createAndPlaceBackground(game),
		system: createAndPlacePlanets(game),
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		button: createAndPlaceButton(game),
		pilotModeButton: createAndPlaceModeButton(game, 'pilot', 1),
		landModeButton: createAndPlaceModeButton(game, 'land', 2),
		modePointer: createAndPlaceModePointer(game),
	};
}

function setup(game, state, actions) {
	const sprites = initSprites(game);
	const { changePressingState, changeControlMode } = actions;
	const { getControlMode } = state;
	setUpButtonControls(game, sprites.button, getControlMode, changePressingState);
	setUpKeyboardControls(game, getControlMode, changePressingState, changeControlMode);
	setUpNavigationRingControls(game, sprites.ring, getControlMode, changePressingState);

	game.state = () => renderGame(game, sprites, state, actions);
}

function load(game) {
	game.loadingBar();
}

function initGame() {
	const [getSpeed, changeSpeed] = makeState({ x: 0, y: 0 });
	const [getPressingState, changePressingState] = makeState({
		up: false,
		down: false,
		left: false,
		right: false,
		ring: false,
	});
	const [getControlMode, changeControlMode] = makeState({ mode: 'pilot' });
	const state = {
		getControlMode,
		getPressingState,
		getSpeed,
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
	};
	const game = hexi(canvasWidth, canvasHeight, () => setup(game, state, actions), filesToLoad, () =>
		load(game)
	);
	game.scaleToWindow();
	game.backgroundColor = 0x000000;
	game.start();
}

initGame();
