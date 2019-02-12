/* @format */

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);
	return sky;
}

export function createAndPlacePlanets(game) {
	const system = game.group();

	const planet = game.circle(50, 'blue');
	planet.x = 20;
	planet.y = 20;
	system.addChild(planet);

	const planet2 = game.circle(30, 'green');
	planet2.x = 90;
	planet2.y = 170;
	system.addChild(planet2);

	game.stage.addChild(system);
	return system;
}

export function createAndPlaceShip(game) {
	const ship = game.sprite('assets/ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.setPivot(0.5, 0.5);
	game.stage.putCenter(ship);
	return ship;
}

export function createAndPlaceNavigationRing(game) {
	const navRing = game.sprite('assets/nav-ring.png');
	navRing.rotation = 0;
	navRing.setPivot(0.5, 0.5);
	navRing.alpha = 0.6;
	game.stage.putCenter(navRing);
	return navRing;
}

export function createAndPlaceButton(game) {
	const button = game.button([
		'assets/button-up.png',
		'assets/button-up.png',
		'assets/button-down.png'
	]);
	game.stage.putCenter(button);
	button.y += 200;
	return button;
}

export function getCurrentCoordinates(game) {
	return { x: game.pointer.x, y: game.pointer.y };
}
