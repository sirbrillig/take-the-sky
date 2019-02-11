/* @format */
/* globals hexi */

import { adjustSpeed, adjustRotation } from './math';
import {
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
const pressing = { up: false, down: false, left: false, right: false };
let speed = { x: 0, y: 0 };

function renderGame(game) {
	speed = adjustSpeed(pressing, ship.rotation, speed);
	ship.rotation = adjustRotation(pressing, ship.rotation);
	ring.rotation = ship.rotation;
	system.vy = speed.y;
	system.vx = speed.x;
	sky.tileX += speed.x;
	sky.tileY += speed.y;
	game.move([ship, system, sky, ring, button]);
}

function setUpKeyboardControls(game) {
	const upArrow = game.keyboard(38);
	const downArrow = game.keyboard(40);
	const leftArrow = game.keyboard(37);
	const rightArrow = game.keyboard(39);
	upArrow.press = () => {
		pressing.up = true;
	};
	upArrow.release = () => {
		pressing.up = false;
	};
	downArrow.press = () => {
		pressing.down = true;
	};
	downArrow.release = () => {
		pressing.down = false;
	};
	leftArrow.press = () => {
		pressing.left = true;
	};
	leftArrow.release = () => {
		pressing.left = false;
	};
	rightArrow.press = () => {
		pressing.right = true;
	};
	rightArrow.release = () => {
		pressing.right = false;
	};
}

function setUpButtonControls(game, button) {
	button.press = () => {
		pressing.up = true;
	};
	button.release = () => {
		pressing.up = false;
	};
}

function setup(game) {
	sky = createAndPlaceBackground(game);
	system = createAndPlacePlanets(game);
	ship = createAndPlaceShip(game);
	ring = createAndPlaceNavigationRing(game);
	button = createAndPlaceButton(game);
	setUpButtonControls(game, button);
	setUpKeyboardControls(game);

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
