/* @format */
/* globals hexi */

import { adjustSpeed, adjustRotation } from './sprites';

const canvasWidth = 512;
const canvasHeight = 512;
const filesToLoad = ['assets/ship.png', 'assets/star-field.png'];

let ship;
const planets = [];
let system;
let sky;
const pressing = { up: false, down: false, left: false, right: false };
let speed = { x: 0, y: 0 };

function play(game) {
	speed = adjustSpeed(pressing, ship.rotation, speed);
	ship.rotation = adjustRotation(pressing, ship.rotation);
	system.vy = speed.y;
	system.vx = speed.x;
	sky.tileX += speed.x;
	sky.tileY += speed.y;
	game.move([ship, system, sky]);
}

function createAndPlaceBackground(game) {
	sky = game.tilingSprite('assets/star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);
}

function createAndPlacePlanets(game) {
	system = game.group();

	const planet = game.circle(50, 'blue');
	planet.x = 20;
	planet.y = 20;
	planets.push(planet);
	system.addChild(planet);

	const planet2 = game.circle(30, 'green');
	planet2.x = 90;
	planet2.y = 170;
	planets.push(planet2);
	system.addChild(planet2);

	game.stage.addChild(system);
}

function createAndPlaceShip(game) {
	ship = game.sprite('assets/ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.setPivot(0.5, 0.5);
	game.stage.putCenter(ship);
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

function setup(game) {
	createAndPlaceBackground(game);
	createAndPlacePlanets(game);
	createAndPlaceShip(game);
	setUpKeyboardControls(game);

	game.state = () => play(game);
}

function load(game) {
	game.loadingBar();
}

function initGame() {
	const game = hexi(canvasWidth, canvasHeight, () => setup(game), filesToLoad, () => load(game));
	game.backgroundColor = 0x000000;
	game.start();
}

initGame();
