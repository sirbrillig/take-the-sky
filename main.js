/* @format */
/* globals PIXI, document */

(function app() {
	let ship;
	const planets = [];
	let system;
	const pressing = { up: false, down: false, left: false, right: false };
	const speed = { x: 0, y: 0 };
	const accelerationRate = 0.1;
	const maxAcceleration = 3;
	const rotationRate = 0.1;

	function play(game) {
		if (pressing.up) {
			speed.y =
				speed.y >= maxAcceleration ? speed.y : speed.y + accelerationRate * Math.sin(ship.rotation);
			speed.x =
				speed.x >= maxAcceleration ? speed.x : speed.x + accelerationRate * Math.cos(ship.rotation);
		}
		if (pressing.left) {
			ship.rotation -= rotationRate;
		}
		if (pressing.right) {
			ship.rotation += rotationRate;
		}
		system.vy = speed.y;
		system.vx = speed.x;
		game.move([ship, system]);
	}

	function setup(game) {
		system = new PIXI.Container();

		// const planet = game.circle(50, 'blue');
		// planet.x = 20;
		// planet.y = 20;
		// planets.push(planet);
		// system.addChild(planet);
		//
		// const planet2 = game.circle(30, 'green');
		// planet2.x = 90;
		// planet2.y = 170;
		// planets.push(planet2);
		// system.addChild(planet2);

		ship = new PIXI.Sprite(PIXI.loader.resources['spaceship.png'].texture);
		ship.pivot.set(11, 16); // TODO center on sprite dynamically
		ship.rotation = Math.floor(Math.random() * Math.floor(360));
		ship.position.set(200, 200); // TODO: center on canvas
		game.stage.addChild(ship);

		game.renderer.render(game.stage);

		// const upArrow = game.keyboard(38);
		// const downArrow = game.keyboard(40);
		// const leftArrow = game.keyboard(37);
		// const rightArrow = game.keyboard(39);
		// upArrow.press = () => {
		// 	pressing.up = true;
		// };
		// upArrow.release = () => {
		// 	pressing.up = false;
		// };
		// downArrow.press = () => {
		// 	pressing.down = true;
		// };
		// downArrow.release = () => {
		// 	pressing.down = false;
		// };
		// leftArrow.press = () => {
		// 	pressing.left = true;
		// };
		// leftArrow.release = () => {
		// 	pressing.left = false;
		// };
		// rightArrow.press = () => {
		// 	pressing.right = true;
		// };
		// rightArrow.release = () => {
		// 	pressing.right = false;
		// };
		// game.state = () => play(game);
	}

	function begin() {
		const game = new PIXI.Application();
		document.body.appendChild(game.view);
		game.renderer.backgroundColor = 0x000000;
		PIXI.loader.add('spaceship.png').load(() => setup(game));

		// const game = hexi(canvasWidth, canvasHeight, () => setup(game));
		// game.backgroundColor = 0x000000;
		// game.start();
	}

	begin();
})();
