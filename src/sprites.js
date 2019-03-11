/* @format */
/* globals GameUtilities */

import { getPlanetsInSystem, getStarsInSystem, getGatesInSystem } from './planets';
import { adjustSpeedForOtherShip, adjustPositionToFollow } from './math';

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
	sky.zIndex = 0;
	game.stage.addChild(sky);
	return sky;
}

function createAndPlacePlanet(game, planetData) {
	const planetSprite = game.circle(planetData.size, planetData.color);
	planetSprite.positionInSpace = planetData.position;
	planetSprite.zIndex = 5;
	setSpritePosition(planetSprite, { x: planetData.position.x, y: planetData.position.y });
	return planetSprite;
}

function createAndPlaceGate(game, gateData) {
	const gate = game.sprite('assets/gate.png');
	gate.zIndex = 5;
	gate.positionInSpace = gateData.position;
	setSpritePosition(gate, { x: gateData.position.x, y: gateData.position.y });
	return gate;
}

export function createAndPlaceOtherShips(game) {
	const shipLayer = game.group();
	const ship = game.sprite('assets/ship-2.png');
	setSpritePosition(ship, { x: 600, y: 20 });
	ship.setPivot(0.5, 0.5);
	ship.zIndex = 10;
	ship.speed = { x: 1, y: 1 };
	shipLayer.addChild(ship);
	game.stage.addChild(shipLayer);
	setSpritePosition(shipLayer, { x: 0, y: 0 });
	return shipLayer;
}

export function createAndPlaceShip(game) {
	const ship = game.sprite('assets/ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.setPivot(0.5, 0.5);
	ship.zIndex = 10;
	game.stage.putCenter(ship);
	return ship;
}

export function createAndPlaceNavigationRing(game) {
	const navRing = game.sprite('assets/nav-ring.png');
	navRing.zIndex = 15;
	navRing.rotation = 0;
	navRing.setPivot(0.5, 0.5);
	navRing.alpha = 0.6;
	game.stage.putCenter(navRing);
	return navRing;
}

export function showDialog(game, text) {
	const dialogText = game.text(text, '28px serif', 'white');
	dialogText.zIndex = 15;
	setSpritePosition(dialogText, { y: game.canvas.height - 50, x: 0 });
	game.stage.addChild(dialogText);
}

export function createAndPlaceModeButton(game, modeTitle, orderIndex) {
	const title = game.text(modeTitle, '32px serif', 'white');
	title.zIndex = 15;
	title.x = 40;
	title.y = 10 * orderIndex * 5;
	game.stage.addChild(title);
	return title;
}

export function createAndPlaceModePointer(game) {
	const pointer = game.sprite('assets/pointer.png');
	pointer.zIndex = 15;
	pointer.x = 10;
	pointer.y = 10 * 5 + 16; // modeButton position + a bit to vertically center it
	game.stage.addChild(pointer);
	return pointer;
}

export function createAndPlaceHealthMeter(game) {
	const outerBar = game.rectangle(128, 16, 'black', 'green', 2);
	const innerBar = game.rectangle(6, 16, 'green');
	const meter = game.group(outerBar, innerBar);
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: game.canvas.width - 148, y: 16 });
	meter.zIndex = 15;
	game.stage.addChild(meter);
	return meter;
}

export function createAndPlaceChargeMeter(game) {
	const outerBar = game.rectangle(164, 16, 'black', 'blue', 2);
	const innerBar = game.rectangle(6, 16, 'blue');
	const limitLine = game.rectangle(2, 14, 'red');
	setSpritePosition(limitLine, { x: 108, y: 2 });
	const meter = game.group(outerBar, innerBar, limitLine);
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: 30, y: 16 });
	meter.zIndex = 15;
	game.stage.addChild(meter);
	return meter;
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

function sortSpritesByZIndex(game) {
	// sort sprites by zorder
	game.stage.children.sort((a, b) => {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;
		return a.zIndex > b.zIndex ? 1 : -1;
	});
}

export function getSpriteMover(game) {
	let lastRenderedSystem = '';
	return (sprites, state) => {
		const {
			getControlMode,
			getSpeed,
			getSystemPosition,
			getCurrentSystem,
			isChargeMeterVisible,
			getChargeMeterAmount,
			getHealthAmount,
		} = state;
		const { ship, sky, ring, modePointer } = sprites;
		const systemPosition = getSystemPosition();

		// render planets, stars, and gates
		if (getCurrentSystem() !== lastRenderedSystem) {
			game.remove(sprites.planets || []);
			const currentSystem = getCurrentSystem();
			sprites.planets = getPlanetsInSystem(currentSystem).map(planetData =>
				createAndPlacePlanet(game, planetData)
			);
			sprites.planets.map(sprite => game.stage.addChild(sprite));

			game.remove(sprites.stars || []);
			sprites.stars = getStarsInSystem(currentSystem).map(starData =>
				createAndPlacePlanet(game, starData)
			);
			sprites.stars.map(sprite => game.stage.addChild(sprite));

			game.remove(sprites.gates || []);
			sprites.gates = getGatesInSystem(currentSystem).map(gateData =>
				createAndPlaceGate(game, gateData)
			);
			sprites.gates.map(sprite => game.stage.addChild(sprite));

			sortSpritesByZIndex(game);
		}
		lastRenderedSystem = getCurrentSystem();
		sprites.planets.map(sprite =>
			setSpritePosition(sprite, {
				x: sprite.positionInSpace.x + systemPosition.x,
				y: sprite.positionInSpace.y + systemPosition.y,
			})
		);
		sprites.stars.map(sprite =>
			setSpritePosition(sprite, {
				x: sprite.positionInSpace.x + systemPosition.x,
				y: sprite.positionInSpace.y + systemPosition.y,
			})
		);
		sprites.gates.map(sprite =>
			setSpritePosition(sprite, {
				x: sprite.positionInSpace.x + systemPosition.x,
				y: sprite.positionInSpace.y + systemPosition.y,
			})
		);

		// render other ships
		if (!sprites.ships) {
			// sprites.ships = createAndPlaceOtherShips(game);
			sprites.ships = game.group();
		}
		const utilites = new GameUtilities();
		sprites.ships.children.forEach(other => {
			other.rotation = utilites.angle(ship, other);
			// adjust the ship's speed to accelerate
			other.speed = adjustSpeedForOtherShip(other.rotation, other.speed);
			// adjust the position to follow the player
			adjustPositionToFollow(other, ship, other.speed);
			// adjust the position for the system position
			setSpritePosition(other, {
				x: other.x + getSpeed().x,
				y: other.y + getSpeed().y,
			});
		});

		// render background
		setTilePosition(sky, { x: systemPosition.x, y: systemPosition.y });

		// render ring
		ring.visible = getControlMode() === 'pilot';

		// render mode pointer
		modePointer.y = getModePointerPositionForMode(getControlMode());

		// render health bar
		if (!sprites.healthMeter) {
			sprites.healthMeter = createAndPlaceHealthMeter(game);
			sortSpritesByZIndex(game);
		}
		sprites.healthMeter.visible = true;
		sprites.healthMeter.innerBar.width =
			(sprites.healthMeter.outerBar.width / 100) * getHealthAmount();

		// render charge meter
		if (!sprites.chargeMeter) {
			sprites.chargeMeter = createAndPlaceChargeMeter(game);
			sortSpritesByZIndex(game);
		}
		if (!isChargeMeterVisible()) {
			sprites.chargeMeter.visible = false;
		}
		if (isChargeMeterVisible()) {
			sprites.chargeMeter.visible = true;
			const amount = getChargeMeterAmount();
			sprites.chargeMeter.innerBar.width = (sprites.chargeMeter.outerBar.width / 100) * amount;
		}
	};
}
