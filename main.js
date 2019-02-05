/* @format */
/* globals hexi */

(function app() {
	const canvasWidth = 512;
	const canvasHeight = 512;

	let ship;
	const planets = [];
	let system;
	const pressing = { up: false, down: false };
	const speed = { x: 0, y: 0 };
	const accelerationRate = 0.1;

	function play(game) {
		if (pressing.up) {
			speed.y += accelerationRate;
		}
		if (pressing.down) {
			speed.y -= accelerationRate;
		}
		if (pressing.left) {
			speed.x += accelerationRate;
		}
		if (pressing.right) {
			speed.x -= accelerationRate;
		}
		system.vy = speed.y;
		system.vx = speed.x;
		game.move([ship, system]);
	}

	function setup(game) {
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

		ship = game.rectangle(10, 25, 'red');
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

	function begin() {
		const game = hexi(canvasWidth, canvasHeight, () => setup(game));
		game.backgroundColor = 0x000000;
		game.start();
	}

	begin();
})();
