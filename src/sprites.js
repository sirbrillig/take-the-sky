/* @format */

import { getPlanetsInSystem, getStarsInSystem, getGatesInSystem } from './planets';
import { adjustSpeedForOtherShip, adjustPositionToFollow, getAngleBetweenSprites } from './math';

export function setSpritePosition(sprite, { x, y }) {
	sprite.position.set(x, y);
}

export function setSpriteRotation(sprite, rotation) {
	sprite.rotation = rotation;
}

export function getSpriteRotation(sprite) {
	return sprite.rotation;
}

export function setTilePosition(sprite, { x, y }) {
	sprite.tilePosition.x = x;
	sprite.tilePosition.y = y;
}

function setSpritePositionToCenter(game, sprite) {
	sprite.anchor.set(0.5, 0.5);
	setSpritePosition(sprite, {
		x: game.renderer.width / 2,
		y: game.renderer.height / 2,
	});
}

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.renderer.width, game.renderer.height);
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
	gate.anchor.set(0.5, 0.5);
	gate.positionInSpace = gateData.position;
	setSpritePosition(gate, { x: gateData.position.x, y: gateData.position.y });
	return gate;
}

export function createAndPlaceOtherShips(game) {
	const shipLayer = game.group();
	const ship = game.sprite('assets/ship-2.png');
	setSpritePosition(ship, { x: 600, y: 20 });
	ship.pivot.set(0.5, 0.5);
	ship.zIndex = 10;
	ship.speed = { x: 1, y: 1 };
	// TODO: set the anchor
	shipLayer.addChild(ship);
	game.stage.addChild(shipLayer);
	setSpritePosition(shipLayer, { x: 0, y: 0 });
	return shipLayer;
}

export function createAndPlaceShip(game) {
	const ship = game.sprite('assets/ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.pivot.set(0.5, 0.5);
	setSpritePositionToCenter(game, ship);
	ship.zIndex = 10;
	game.stage.addChild(ship);
	return ship;
}

export function createAndPlaceNavigationRing(game) {
	const navRing = game.sprite('assets/nav-ring.png');
	navRing.zIndex = 15;
	navRing.rotation = 0;
	navRing.pivot.set(0.5, 0.5);
	navRing.alpha = 0.6;
	setSpritePositionToCenter(game, navRing);
	game.stage.addChild(navRing);
	return navRing;
}

export function createAndPlaceDialog(game) {
	const boxPadding = 10;
	const box = game.rectangle(game.renderer.width - 40, 200, 0x00335a, 0x0f95ff, 2);
	// See formatting options: https://pixijs.io/pixi-text-style/#
	const dialogText = game.text('', {
		fontFamily: 'Arial',
		fontSize: 28,
		fill: 'white',
		wordWrap: true,
		wordWrapWidth: box.width - boxPadding * 2,
	});
	setSpritePosition(dialogText, { x: boxPadding, y: boxPadding });
	box.addChild(dialogText);
	const continueButton = game.rectangle(110, 35, 0x000000, 0x0f95ff, 1);
	setSpritePosition(continueButton, {
		x: box.width - continueButton.width - boxPadding * 2,
		y: box.height - boxPadding * 2 - continueButton.height,
	});
	const continueButtonText = game.text('Continue', {
		fontFamily: 'Arial',
		fontSize: 20,
		fill: 0xffffff,
	});
	setSpritePosition(continueButtonText, {
		x: continueButton.width / 2 - continueButtonText.width / 2,
		y: continueButton.height / 2 - continueButtonText.height / 2,
	});
	continueButton.addChild(continueButtonText);
	box.addChild(continueButton);
	box.zIndex = 15;
	setSpritePosition(box, { x: 20, y: game.renderer.height - 210 });
	box.visible = false;
	box.textArea = dialogText;
	game.stage.addChild(box);
	return box;
}

export function createAndPlaceModeButton(game, modeTitle, orderIndex) {
	const buttonLabel = game.text(modeTitle, { fontFamily: 'Arial', fontSize: 36, fill: 'white' });
	buttonLabel.zIndex = 15;
	setSpritePosition(buttonLabel, { x: 40, y: 10 * orderIndex * 5 });
	game.stage.addChild(buttonLabel);
	return buttonLabel;
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
	const outerBar = game.rectangle(128, 16, 0x000000, 0x008000, 2);
	const innerBar = game.rectangle(6, 16, 0x008000);
	const meter = game.group();
	meter.addChild(outerBar);
	meter.addChild(innerBar);
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: game.renderer.width - 148, y: 16 });
	meter.zIndex = 15;
	game.stage.addChild(meter);
	return meter;
}

export function createAndPlaceChargeMeter(game) {
	const outerBar = game.rectangle(164, 16, 0x000000, 0x0000ff, 2);
	const innerBar = game.rectangle(6, 16, 0x0000ff);
	const limitLine = game.rectangle(2, 14, 0xff0000);
	setSpritePosition(limitLine, { x: 108, y: 2 });
	const meter = game.group();
	meter.addChild(outerBar);
	meter.addChild(innerBar);
	meter.addChild(limitLine);
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: 30, y: 16 });
	meter.zIndex = 15;
	game.stage.addChild(meter);
	return meter;
}

export function isChargeMeterFull(amount) {
	// 66% of the full bar width (164px) is approximately 108px, where the limitLine is.
	return amount > 66;
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
			isDialogVisible,
			getDialogText,
		} = state;
		const { ship, sky, ring, modePointer } = sprites;
		const systemPosition = getSystemPosition();

		// render dialog
		sprites.dialog.visible = isDialogVisible();
		sprites.dialog.textArea.text = getDialogText();

		// render planets, stars, and gates
		if (getCurrentSystem() !== lastRenderedSystem) {
			if (sprites.planets) {
				sprites.planets.map(sprite => game.stage.removeChild(sprite));
			}
			const currentSystem = getCurrentSystem();
			sprites.planets = getPlanetsInSystem(currentSystem).map(planetData =>
				createAndPlacePlanet(game, planetData)
			);
			sprites.planets.map(sprite => game.stage.addChild(sprite));

			if (sprites.stars) {
				sprites.stars.map(sprite => game.stage.removeChild(sprite));
			}
			sprites.stars = getStarsInSystem(currentSystem).map(starData =>
				createAndPlacePlanet(game, starData)
			);
			sprites.stars.map(sprite => game.stage.addChild(sprite));

			if (sprites.gates) {
				sprites.gates.map(gate => game.stage.removeChild(gate));
			}
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
			sprites.ships = { children: [] };
		}
		sprites.ships.children.forEach(other => {
			other.rotation = getAngleBetweenSprites(ship, other);
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

/**
 * Determine if two sprites overlap
 *
 * Each sprite object must have a width and a height property, as well as an x
 * and a y property. The x and y properties MUST be the center of each sprite.
 */
export function doSpritesOverlap(r1, r2) {
	// Find the center points of each sprite
	const r1CenterX = r1.x;
	const r1CenterY = r1.y;
	const r2CenterX = r2.x;
	const r2CenterY = r2.y;

	// Find the half-widths and half-heights of each sprite
	const r1HalfWidth = r1.width / 2;
	const r1HalfHeight = r1.height / 2;
	const r2HalfWidth = r2.width / 2;
	const r2HalfHeight = r2.height / 2;

	// Calculate the distance vector between the sprites
	const vx = r1CenterX - r2CenterX;
	const vy = r1CenterY - r2CenterY;

	// Figure out the combined half-widths and half-heights
	const combinedHalfWidths = r1HalfWidth + r2HalfWidth;
	const combinedHalfHeights = r1HalfHeight + r2HalfHeight;

	// Check for a collision on the x axis
	if (Math.abs(vx) < combinedHalfWidths) {
		// A collision might be occurring. Check for a collision on the y axis
		if (Math.abs(vy) < combinedHalfHeights) {
			// There's definitely a collision happening
			return true;
		}
		// There's no collision on the y axis
		return false;
	}
	return false;
}
