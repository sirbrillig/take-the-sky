/* @format */
/* globals hexi */

import { adjustSpeed, adjustRotation, getNewRingRotation } from './math';
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

let ship;
let system;
let sky;
let ring;
let button;
let pressing = { up: false, down: false, left: false, right: false, ring: false };
let speed = { x: 0, y: 0 };

function changePressingState(newState) {
	pressing = { ...pressing, ...newState };
}

function renderGame(game) {
	speed = adjustSpeed(pressing, ship.rotation, speed);
	ship.rotation = adjustRotation(pressing, ship.rotation);
	if (pressing.ring) {
		const currentCoordinates = getCurrentCoordinates(game);
		// TODO: this goes in reverse on the right side of the ring
		// TODO: the rotation is way too fast
		ship.rotation += getNewRingRotation(ring, pressing.ring, currentCoordinates);
		changePressingState({ ring: currentCoordinates });
	}
	ring.rotation = ship.rotation;
	system.vy = speed.y;
	system.vx = speed.x;
	sky.tileX += speed.x;
	sky.tileY += speed.y;
	game.move([ship, system, sky, ring, button]);
}

function setup(game) {
	sky = createAndPlaceBackground(game);
	system = createAndPlacePlanets(game);
	ship = createAndPlaceShip(game);
	ring = createAndPlaceNavigationRing(game);
	button = createAndPlaceButton(game);
	setUpButtonControls(game, button, changePressingState);
	setUpKeyboardControls(game, changePressingState);
	setUpNavigationRingControls(game, ring, changePressingState);

	game.state = () => renderGame(game);
}

function load(game) {
	game.loadingBar();
}

function initGame() {
	const game = hexi(canvasWidth, canvasHeight, () => setup(game), filesToLoad, () => load(game));
	game.scaleToWindow();
	game.backgroundColor = 0x000000;
	game.start();
}

initGame();
