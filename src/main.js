/* @format */
/* globals hexi */

import { adjustSpeed, adjustRotation, getNewRingRotation } from './math';
import makeState from './state';
import {
	setUpButtonControls,
	setUpKeyboardControls,
	setUpNavigationRingControls
} from './controls';
import {
	getCurrentCoordinates,
	createAndPlaceBackground,
	createAndPlacePlanets,
	createAndPlaceShip,
	createAndPlaceNavigationRing,
	createAndPlaceButton
} from './sprites';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/ship.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/button-up.png',
	'assets/button-down.png'
];

function renderGame(game, changePressingState, getPressingState, changeSpeed, getSpeed, sprites) {
	const { ship, system, ring, sky } = sprites;
	const pressing = getPressingState();
	changeSpeed(adjustSpeed(pressing, ship.rotation, getSpeed()));
	ship.rotation = adjustRotation(pressing, ship.rotation);
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
	game.move(Object.values(sprites));
}

function setup(game, changePressingState, getPressingState, changeSpeed, getSpeed) {
	const sprites = {
		sky: createAndPlaceBackground(game),
		system: createAndPlacePlanets(game),
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		button: createAndPlaceButton(game)
	};
	setUpButtonControls(game, sprites.button, changePressingState);
	setUpKeyboardControls(game, changePressingState);
	setUpNavigationRingControls(game, sprites.ring, changePressingState);

	game.state = () =>
		renderGame(game, changePressingState, getPressingState, changeSpeed, getSpeed, sprites);
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
		ring: false
	});
	const game = hexi(
		canvasWidth,
		canvasHeight,
		() => setup(game, changePressingState, getPressingState, changeSpeed, getSpeed),
		filesToLoad,
		() => load(game)
	);
	game.scaleToWindow();
	game.backgroundColor = 0x000000;
	game.start();
}

initGame();
