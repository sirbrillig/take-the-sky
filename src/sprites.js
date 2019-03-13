/* @format */

import { getPlanetsInSystem, getStarsInSystem, getGatesInSystem } from './planets';
import { adjustSpeedForOtherShip, adjustPositionToFollow, getAngleBetweenSprites } from './math';
import { getDialogObjectForKey } from './dialog-tree';

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

function createTextAreaForDialog(game, box, boxPadding) {
	// See formatting options: https://pixijs.io/pixi-text-style/#
	const dialogText = game.text('', {
		fontFamily: 'Arial',
		fontSize: 24,
		fill: 'white',
		wordWrap: true,
		wordWrapWidth: box.width - boxPadding * 2,
	});
	dialogText.zIndex = 16;
	setSpritePosition(dialogText, { x: boxPadding, y: boxPadding });
	return dialogText;
}

function createDialogOption(game, option, index) {
	const dialogText = game.text(option.text, {
		fontFamily: 'Arial',
		fontSize: 24,
		fill: 'white',
	});
	const paddingForArrow = 28;
	setSpritePosition(dialogText, {
		x: paddingForArrow,
		y: index * 35,
	});
	return dialogText;
}

function createDialogOptions(game, dialog, currentDialogObject) {
	dialog.optionArea.removeChildren();

	currentDialogObject.options.map((option, index) => {
		const optionTextArea = createDialogOption(game, option, index);
		dialog.optionArea.addChild(optionTextArea);
		return optionTextArea;
	});

	const arrow = game.sprite('assets/pointer.png');
	arrow.anchor.set(0.5, 0.5);
	arrow.x = 10;
	arrow.y = arrow.height;
	dialog.optionArea.addChild(arrow);

	dialog.changeSelectedOption = index => {
		arrow.y = arrow.height + index * 32;
	};

	arrow.visible = !!currentDialogObject.options.length;
}

export function createAndPlaceDialog(game) {
	const boxPadding = 10;
	const box = game.rectangle(game.renderer.width - 40, 250, 0x00335a, 0x0f95ff, 2);

	const dialogText = createTextAreaForDialog(game, box, boxPadding);
	box.addChild(dialogText);

	box.optionArea = game.group();
	setSpritePosition(box.optionArea, { x: boxPadding, y: box.height - 110 });
	box.addChild(box.optionArea);

	box.zIndex = 15;
	setSpritePosition(box, { x: 20, y: game.renderer.height - 260 });
	box.visible = false;
	box.textArea = dialogText;
	box.boxPadding = boxPadding;
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
	const outerBar = game.rectangle(164, 24, 0x000000, 0x008000, 2);
	const innerBar = game.rectangle(6, 24, 0x008000);
	const meterLabel = game.text('Hull strength', {
		fontFamily: 'Arial',
		fontSize: 20,
		fill: 0xffffff,
	});
	const meter = game.group();
	meter.addChild(outerBar);
	meter.addChild(innerBar);
	meter.addChild(meterLabel);
	setSpritePosition(meterLabel, { x: -120, y: 0 });
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: game.renderer.width - 188, y: 16 });
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

export function explodeShip(game) {
	const images = [
		'assets/explosion_01.png',
		'assets/explosion_02.png',
		'assets/explosion_03.png',
		'assets/explosion_04.png',
		'assets/explosion_05.png',
		'assets/explosion_06.png',
		'assets/explosion_07.png',
	];
	const animatedSprite = game.animatedSpriteFromImages(images);
	setSpritePositionToCenter(game, animatedSprite);
	animatedSprite.animationSpeed = 0.2;
	animatedSprite.loop = false;
	animatedSprite.onComplete = () => animatedSprite.destroy();
	game.stage.addChild(animatedSprite);
	animatedSprite.play();
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

function isChargeMeterVisible({ getControlMode, getChargeMeterAmount }) {
	return ['land', 'jump'].includes(getControlMode()) || getChargeMeterAmount() > 1;
}

export function getSpriteMover(game) {
	let lastRenderedSystem = '';
	let lastShownDialog = '';
	return (sprites, state, actions) => {
		const {
			getControlMode,
			getSpeed,
			getSystemPosition,
			getCurrentSystem,
			getChargeMeterAmount,
			getHealthAmount,
			isDialogVisible,
			getDialogKey,
			getDialogSelection,
			getEvent,
		} = state;
		const { handleAction } = actions;
		const systemPosition = getSystemPosition();

		// render dialog
		if (lastShownDialog !== getDialogKey() && isDialogVisible()) {
			sprites.dialog.visible = true;
			const currentDialogObject = getDialogObjectForKey(getDialogKey());
			sprites.dialog.textArea.text = currentDialogObject.text;
			if (currentDialogObject.action) {
				handleAction(currentDialogObject.action);
			}
			createDialogOptions(game, sprites.dialog, currentDialogObject);
		}
		if (sprites.dialog.visible && !isDialogVisible()) {
			sprites.dialog.visible = false;
		}
		if (isDialogVisible()) {
			sprites.dialog.changeSelectedOption(getDialogSelection());
		}
		lastShownDialog = getDialogKey();

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
			other.rotation = getAngleBetweenSprites(sprites.ship, other);
			// adjust the ship's speed to accelerate
			other.speed = adjustSpeedForOtherShip(other.rotation, other.speed);
			// adjust the position to follow the player
			adjustPositionToFollow(other, sprites.ship, other.speed);
			// adjust the position for the system position
			setSpritePosition(other, {
				x: other.x + getSpeed().x,
				y: other.y + getSpeed().y,
			});
		});

		// render background
		setTilePosition(sprites.sky, { x: systemPosition.x, y: systemPosition.y });

		// render ring
		sprites.ring.visible = !getEvent('gameOver') && getControlMode() === 'pilot';

		// render mode pointer
		sprites.modePointer.y = getModePointerPositionForMode(getControlMode());

		// render health bar
		sprites.healthMeter.innerBar.width =
			(sprites.healthMeter.outerBar.width / 100) * getHealthAmount();

		// render charge meter
		if (!isChargeMeterVisible(state)) {
			sprites.chargeMeter.visible = false;
		}
		if (isChargeMeterVisible(state)) {
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
