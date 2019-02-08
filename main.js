/* @format */
/* globals hexi */

const canvasWidth = 512;
const canvasHeight = 512;
const filesToLoad = ['ship.png', 'star-field.png'];

let ship;
const planets = [];
let system;
let sky;
const pressing = { up: false, down: false, left: false, right: false };
const speed = { x: 0, y: 0 };
const accelerationRate = 0.1;
const maxAcceleration = 3;
const rotationRate = 0.1;

function play(game) {
	if (pressing.up) {
		speed.y += accelerationRate * Math.sin(ship.rotation);
		speed.x += accelerationRate * Math.cos(ship.rotation);
	}
	if (speed.y > maxAcceleration) {
		speed.y = maxAcceleration;
	}
	if (speed.x > maxAcceleration) {
		speed.x = maxAcceleration;
	}
	// TODO: handle negative max speed
	if (pressing.left) {
		ship.rotation -= rotationRate;
	}
	if (pressing.right) {
		ship.rotation += rotationRate;
	}
	system.vy = speed.y;
	system.vx = speed.x;
	sky.tileX += speed.x;
	sky.tileY += speed.y;
	game.move([ship, system, sky]);
}

function setup(game) {
	system = game.group();

	sky = game.tilingSprite('star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);

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

	ship = game.sprite('ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.setPivot(0.5, 0.5);
	game.stage.putCenter(ship);
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
	game.state = () => play(game);
}

function load(game) {
	game.loadingBar();
}

function begin() {
	const game = hexi(canvasWidth, canvasHeight, () => setup(game), filesToLoad, () => load(game));
	game.backgroundColor = 0x000000;
	game.start();
}

begin();
