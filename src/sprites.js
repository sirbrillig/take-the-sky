/* @format */

import { getPlanetsInSystem, getStarsInSystem, getGatesInSystem } from './planets';

export function setSpritePosition(sprite, { x, y }) {
	sprite.setPosition(x, y);
}

export function setSpriteRotation(sprite, rotation) {
	sprite.rotation = rotation;
}

export function getSpriteRotation(sprite) {
	return sprite.rotation;
}

export function setTilePosition(sprite, { x, y }) {
	sprite.tileX = x;
	sprite.tileY = y;
}

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);
	return sky;
}

function createAndPlacePlanet(game, planetData) {
	const planetSprite = game.circle(planetData.size, planetData.color);
	setSpritePosition(planetSprite, { x: planetData.position.x, y: planetData.position.y });
	return planetSprite;
}

function createAndPlaceGate(game, gateData) {
	const gate = game.sprite('assets/gate.png');
	setSpritePosition(gate, { x: gateData.position.x, y: gateData.position.y });
	return gate;
}

export function createAndPlaceOtherShips(game) {
	const shipLayer = game.group();
	const ship = game.sprite('assets/ship-2.png');
	setSpritePosition(ship, { x: 600, y: 20 });
	ship.vx = -2;
	shipLayer.addChild(ship);
	game.stage.addChild(shipLayer);
	return shipLayer;
}

export function createAndPlacePlanets(game, currentSystem) {
	const system = game.group();

	const planetSprites = getPlanetsInSystem(currentSystem).map(planetData =>
		createAndPlacePlanet(game, planetData)
	);
	planetSprites.map(sprite => system.addChild(sprite));

	const starSprites = getStarsInSystem(currentSystem).map(starData =>
		createAndPlacePlanet(game, starData)
	);
	starSprites.map(sprite => system.addChild(sprite));

	const gateSprites = getGatesInSystem(currentSystem).map(gateData =>
		createAndPlaceGate(game, gateData)
	);
	gateSprites.map(sprite => system.addChild(sprite));

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
		'assets/button-down.png',
	]);
	game.stage.putCenter(button);
	button.y += 200;
	return button;
}

export function createAndPlaceModeButton(game, modeTitle, orderIndex) {
	const title = game.text(modeTitle, '32px serif', 'white');
	title.x = 40;
	title.y = 10 * orderIndex * 5;
	game.stage.addChild(title);
	return title;
}

export function createAndPlaceModePointer(game) {
	const pointer = game.sprite('assets/pointer.png');
	pointer.x = 10;
	pointer.y = 10 * 5 + 16; // modeButton position + a bit to vertically center it
	game.stage.addChild(pointer);
	return pointer;
}

export function getCurrentCoordinates(game) {
	return { x: game.pointer.x, y: game.pointer.y };
}

export function getModePointerPositionForMode(modeName) {
	switch (modeName) {
		case 'jump':
			return 10 * 3 * 5 + 16;
		case 'land':
			return 10 * 2 * 5 + 16;
		case 'pilot':
			return 10 * 5 + 16; // modeButton position + a bit to vertically center it
		default:
			throw new Error(`No mode named ${modeName}`);
	}
}

export function getSpriteMover(game) {
	let lastRenderedSystem = '';
	return (sprites, state) => {
		const { getControlMode, getSystemPosition, getCurrentSystem } = state;
		const { sky, ring, modePointer } = sprites;
		const systemPosition = getSystemPosition();

		// render planets
		if (getCurrentSystem() !== lastRenderedSystem) {
			if (sprites.system) {
				game.remove(sprites.system);
			}
			sprites.system = createAndPlacePlanets(game, getCurrentSystem());
		}
		lastRenderedSystem = getCurrentSystem();
		setSpritePosition(sprites.system, { x: systemPosition.x, y: systemPosition.y });

		// render other ships
		if (!sprites.ships) {
			sprites.ships = createAndPlaceOtherShips(game);
		}
		sprites.ships.children.forEach(ship => {
			setSpritePosition(ship, { x: ship.x + ship.vx, y: ship.y + ship.vy });
		});
		setSpritePosition(sprites.ships, { x: systemPosition.x, y: systemPosition.y });

		// render background
		setTilePosition(sky, { x: systemPosition.x, y: systemPosition.y });

		// render ring
		ring.visible = getControlMode() === 'pilot';

		// render mode pointer
		modePointer.y = getModePointerPositionForMode(getControlMode());
	};
}
