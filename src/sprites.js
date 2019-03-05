/* @format */

import { getPlanetsInSystem } from './planets';

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);
	return sky;
}

function createAndPlacePlanet(game, planetData) {
	const planetSprite = game.circle(planetData.size, planetData.color);
	planetSprite.setPosition(planetData.position.x, planetData.position.y);
	return planetSprite;
}

export function createAndPlacePlanets(game) {
	const system = game.group();

	const planetSprites = getPlanetsInSystem().map(planetData =>
		createAndPlacePlanet(game, planetData)
	);
	planetSprites.map(sprite => system.addChild(sprite));

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

export function setSpriteRotation(sprite, rotation) {
	sprite.rotation = rotation;
}

export function getSpriteRotation(sprite) {
	return sprite.rotation;
}

export function setSpriteAcceleration(sprite, { x, y }) {
	sprite.vy = y;
	sprite.vx = x;
}

export function setTilePosition(sprite, { x, y }) {
	sprite.tileX += x;
	sprite.tileY += y;
}

export function moveSprites(sprites, state) {
	const { getSpeed, getControlMode } = state;
	const { system, sky, ring, modePointer } = sprites;
	const speed = getSpeed();
	setSpriteAcceleration(system, speed);
	setTilePosition(sky, speed);
	ring.visible = getControlMode() === 'pilot';
	modePointer.y = getModePointerPositionForMode(getControlMode());
}

export function getSpriteRenderer(game) {
	return sprites => game.move(sprites);
}
