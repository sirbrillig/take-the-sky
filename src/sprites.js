/* @format */

import debugFactory, { debugTextFactory } from './debug';
import { getPlanetsInSystem, getStarsInSystem, getGatesInSystem } from './planets';
import { getTurningDirectionFromPressingState } from './controls';
import {
	areVectorsSame,
	adjustRotationForDirection,
	getScreenPositionFromSpacePosition,
} from './math';
import {
	getEvent,
	getCurrentSystem,
	getPlayerPosition,
	getHealthAmount,
	getShipDataForId,
} from './selectors';
import getDialogObjectForKey, { executeScript } from './dialog/index';
import { getOtherShipsToCreate, getShipSpriteForType } from './other-ships';
import ShipAi from './ship-ai';
import Vector from './vector';

const debug = debugFactory('sky:sprites');
const displayDebugText = debugTextFactory('sky:stats');

export function setSpritePosition(sprite, { x, y }) {
	sprite.position.set(x, y);
}

export function setTilePosition(sprite, { x, y }) {
	sprite.tilePosition.x = x;
	sprite.tilePosition.y = y;
}

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.canvasWidth, game.canvasHeight);
	sky.zIndex = 0;
	game.mainContainer.addChild(sky);
	return sky;
}

function createAndPlaceStar(game, planetData) {
	const planetSprite = game.sprite('assets/sun.png');
	planetSprite.positionInSpace = planetData.position;
	planetSprite.anchor.set(0.5, 0.5);
	planetSprite.zIndex = 5;
	planetSprite.width = planetData.size;
	planetSprite.height = planetData.size;
	planetSprite.planetData = planetData;
	setSpritePosition(planetSprite, { x: planetData.position.x, y: planetData.position.y });
	return planetSprite;
}

function createAndPlacePlanet(game, planetData) {
	const planetSprite = game.sprite('assets/planet-1.png');
	planetSprite.positionInSpace = planetData.position;
	planetSprite.zIndex = 5;
	planetSprite.width = planetData.size;
	planetSprite.height = planetData.size;
	planetSprite.planetData = planetData;
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

export function createAndPlaceOtherShips(game, shipDataObjects, playerPosition) {
	return shipDataObjects.map(shipData => {
		const ship = game.sprite(getShipSpriteForType(shipData.shipType));
		ship.shipId = shipData.shipId;
		ship.zIndex = 10;
		ship.pivot.set(0.5, 0.5);
		ship.anchor.set(0.5, 0.5);
		ship.positionInSpace = shipData.positionInSpace;
		setSpritePosition(
			ship,
			getScreenPositionFromSpacePosition(shipData.positionInSpace, playerPosition)
		);
		game.mainContainer.addChild(ship);
		return ship;
	});
}

export function createAndPlaceShip(game, playerPosition) {
	const ship = game.sprite('assets/player-idle.png');
	ship.rotation = Math.random() * Math.PI * 2;
	ship.pivot.set(0.5, 0.5);
	ship.anchor.set(0.5, 0.5);
	setSpritePosition(ship, playerPosition);
	ship.zIndex = 10;
	game.mainContainer.addChild(ship);
	return ship;
}

export function createAndPlacePlayerEngineOn(game, playerPosition) {
	const images = ['assets/player-engine-on-1.png', 'assets/player-engine-on-2.png'];
	const animatedSprite = game.animatedSpriteFromImages(images);
	animatedSprite.pivot.set(0.5, 0.5);
	animatedSprite.anchor.set(0.5, 0.5);
	animatedSprite.zIndex = 10;
	setSpritePosition(animatedSprite, playerPosition);
	animatedSprite.animationSpeed = 0.2;
	animatedSprite.loop = true;
	animatedSprite.visible = false;
	game.mainContainer.addChild(animatedSprite);
	return animatedSprite;
}

export function createAndPlaceNavigationRing(game, playerPosition) {
	const navRing = game.sprite('assets/nav-ring.png');
	navRing.zIndex = 15;
	navRing.rotation = 0;
	navRing.pivot.set(0.5, 0.5);
	navRing.alpha = 0.6;
	navRing.anchor.set(0.5, 0.5);
	setSpritePosition(navRing, playerPosition);
	game.mainContainer.addChild(navRing);
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
	const textHeight = 35;
	setSpritePosition(dialogText, {
		x: paddingForArrow,
		y: index * textHeight,
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
	setSpritePosition(arrow, { x: 10, y: arrow.height });
	dialog.optionArea.addChild(arrow);

	const textHeight = 32;
	dialog.changeSelectedOption = index => {
		arrow.y = arrow.height + index * textHeight;
	};

	arrow.visible = !!currentDialogObject.options.length;
}

export function createAndPlaceDialog(game) {
	const boxPadding = 10;
	const box = game.rectangle(game.canvasWidth - 40, 250, 0x00335a, 0x0f95ff, 2);

	const dialogText = createTextAreaForDialog(game, box, boxPadding);
	box.addChild(dialogText);

	box.optionArea = game.group();
	const optionAreaHeight = 90;
	setSpritePosition(box.optionArea, { x: boxPadding, y: box.height - optionAreaHeight });
	box.addChild(box.optionArea);

	box.zIndex = 15;
	setSpritePosition(box, { x: 20, y: game.canvasHeight - box.height - 10 });
	box.visible = false;
	box.textArea = dialogText;
	box.boxPadding = boxPadding;
	game.mainContainer.addChild(box);
	return box;
}

function createModeOption(game, modeTitle, orderIndex, boxPadding) {
	const buttonLabel = game.text(modeTitle, { fontFamily: 'Arial', fontSize: 24, fill: 'white' });
	buttonLabel.zIndex = 15;
	setSpritePosition(buttonLabel, { x: 30, y: 30 * orderIndex + boxPadding });
	return buttonLabel;
}

export function createAndPlaceModeControls(game) {
	const boxPadding = 10;
	const box = game.rectangle(110, 110, 0x00335a, 0x0f95ff, 2);
	box.zIndex = 15;

	const getModePointerIndexForMode = modeName => {
		return ['pilot', 'land', 'jump'].indexOf(modeName);
	};

	const pilotModeButton = createModeOption(
		game,
		'pilot',
		getModePointerIndexForMode('pilot'),
		boxPadding
	);
	const landModeButton = createModeOption(
		game,
		'land',
		getModePointerIndexForMode('land'),
		boxPadding
	);
	const jumpModeButton = createModeOption(
		game,
		'jump',
		getModePointerIndexForMode('jump'),
		boxPadding
	);
	box.addChild(pilotModeButton);
	box.addChild(landModeButton);
	box.addChild(jumpModeButton);

	const arrow = game.sprite('assets/pointer.png');
	arrow.anchor.set(0.5, 0.5);
	setSpritePosition(arrow, { x: 15, y: arrow.height + boxPadding });
	box.addChild(arrow);

	box.changeSelectedOption = name => {
		arrow.y = arrow.height + boxPadding + getModePointerIndexForMode(name) * 30;
	};

	setSpritePosition(box, { x: game.canvasWidth - box.width - 20, y: 85 });
	game.mainContainer.addChild(box);
	return box;
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
	setSpritePosition(meter, { x: game.canvasWidth - outerBar.width - 20, y: 16 });
	meter.zIndex = 15;
	game.mainContainer.addChild(meter);
	return meter;
}

export function createAndPlaceChargeMeter(game) {
	const outerBar = game.rectangle(164, 24, 0x000000, 0x0000ff, 2);
	const innerBar = game.rectangle(6, 24, 0x0000ff);
	const limitLine = game.rectangle(2, 14, 0xff0000);
	setSpritePosition(limitLine, { x: 108, y: 4 });
	const meterLabel = game.text('Charge', {
		fontFamily: 'Arial',
		fontSize: 20,
		fill: 0xffffff,
	});
	const meter = game.group();
	meter.addChild(outerBar);
	meter.addChild(innerBar);
	meter.addChild(limitLine);
	meter.addChild(meterLabel);
	setSpritePosition(meterLabel, { x: -80, y: 0 });
	meter.innerBar = innerBar;
	meter.outerBar = outerBar;
	setSpritePosition(meter, { x: game.canvasWidth - outerBar.width - 20, y: 50 });
	meter.zIndex = 15;
	game.mainContainer.addChild(meter);
	return meter;
}

export function explodeShip(game, sprites) {
	const animatedSprite = game.animatedSpriteFromSpriteSheet('assets/explosion.json');
	setSpritePosition(animatedSprite, sprites.ship.position);
	animatedSprite.animationSpeed = 0.6;
	animatedSprite.loop = false;
	animatedSprite.pivot.set(0.5, 0.5);
	animatedSprite.anchor.set(0.5, 0.5);
	animatedSprite.zIndex = 10;
	animatedSprite.onComplete = () => animatedSprite.destroy();
	game.mainContainer.addChild(animatedSprite);
	sprites.ship.visible = false;
	animatedSprite.play();
}

export function isChargeMeterFull(amount) {
	// 66% of the full bar width (164px) is approximately 108px, where the limitLine is.
	return amount > 66;
}

export function getCurrentCoordinates(game) {
	return { x: game.pointer.x, y: game.pointer.y };
}

function sortSpritesByZIndex(game) {
	// sort sprites by zorder
	game.mainContainer.children.sort((a, b) => {
		a.zIndex = a.zIndex || 0;
		b.zIndex = b.zIndex || 0;
		return a.zIndex > b.zIndex ? 1 : -1;
	});
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

function isChargeMeterVisible({ getControlMode, getChargeMeterAmount }) {
	return ['land', 'jump'].includes(getControlMode()) || getChargeMeterAmount() > 1;
}

export function isShipTouchingStar({ stars, ship }) {
	return stars && stars.find(star => doSpritesOverlap(ship, star));
}

export function getPlanetTouchingShip({ planets, ship }) {
	return planets && planets.find(planet => doSpritesOverlap(ship, planet));
}

export function isShipTouchingGate({ gates, ship }) {
	return gates && gates.find(gate => doSpritesOverlap(ship, gate));
}

function moveOtherShipForBehavior({
	game,
	getState,
	showDialog,
	shipSprite,
	shipData,
	playerSprite,
	handleAction,
}) {
	const ai = new ShipAi({
		game,
		getState,
		showDialog,
		handleAction,
		playerVector: new Vector(playerSprite.x, playerSprite.y),
		shipVector: new Vector(shipSprite.x, shipSprite.y),
		rotation: shipSprite.rotation,
		changeRotationCallback: radians => {
			shipSprite.rotation = radians;
		},
		changeSpeedCallback: newSpeed => {
			// move ship based on speed; we have to subtract because the ship is moving toward the player I guess
			const newPosition = {
				x: shipData.positionInSpace.x - newSpeed.x,
				y: shipData.positionInSpace.y - newSpeed.y,
			};
			if (
				areVectorsSame(newPosition, shipData.positionInSpace) &&
				areVectorsSame(newSpeed, shipData.speed)
			) {
				return;
			}
			const newShipData = {
				...shipData,
				positionInSpace: newPosition,
				speed: newSpeed,
			};
			handleAction({
				type: 'CHANGE_OTHER_SHIP_DATA',
				payload: newShipData,
			});
		},
		speed: shipData.speed,
	});
	shipData.behavior(ai);
}

function moveSpritesForPlayerPosition(sprites, playerPosition) {
	sprites.forEach(sprite =>
		setSpritePosition(
			sprite,
			getScreenPositionFromSpacePosition(sprite.positionInSpace, playerPosition)
		)
	);
}

export function getSpriteMover(game) {
	let lastRenderedSystem = '';
	let lastShownDialog = '';
	return (sprites, state, actions) => {
		const {
			getControlMode,
			getChargeMeterAmount,
			isDialogVisible,
			getDialogKey,
			getDialogSelection,
			getPressingState,
			getState,
		} = state;
		const { handleAction, showDialog } = actions;
		const pressing = getPressingState();
		const playerPosition = getPlayerPosition(getState());

		// render player ship
		if (!isDialogVisible() && getControlMode() === 'pilot' && (pressing.left || pressing.right)) {
			sprites.ship.rotation = adjustRotationForDirection(
				sprites.ship.rotation,
				getTurningDirectionFromPressingState(pressing)
			);
		}
		displayDebugText({
			game,
			id: 'radP',
			text: sprites.ship.rotation,
			x: sprites.ship.x + 30,
			y: sprites.ship.y + 30,
		});
		if (!sprites.playerEngineOn) {
			sprites.playerEngineOn = createAndPlacePlayerEngineOn(game, getPlayerPosition(getState()));
		}
		if (!isDialogVisible() && getControlMode() === 'pilot' && pressing.up) {
			sprites.ship.visible = false;
			sprites.playerEngineOn.rotation = sprites.ship.rotation;
			sprites.playerEngineOn.visible = true;
			sprites.playerEngineOn.play();
		}
		if (!isDialogVisible() && getControlMode() === 'pilot' && !pressing.up) {
			sprites.ship.visible = true;
			sprites.playerEngineOn.visible = false;
			sprites.playerEngineOn.stop();
		}
		if (getEvent(getState(), 'gameOver')) {
			sprites.ship.visible = false;
			sprites.playerEngineOn.visible = false;
		}

		// render dialog
		if (lastShownDialog !== getDialogKey() && isDialogVisible()) {
			sprites.dialog.visible = true;
			const currentDialogObject = getDialogObjectForKey(getDialogKey(), getState(), handleAction);
			sprites.dialog.textArea.text = currentDialogObject.text;
			if (currentDialogObject.action) {
				handleAction(currentDialogObject.action);
			}
			if (currentDialogObject.script) {
				executeScript(getState(), handleAction, currentDialogObject.script);
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
		if (getCurrentSystem(getState()) !== lastRenderedSystem) {
			if (sprites.planets) {
				sprites.planets.map(sprite => game.mainContainer.removeChild(sprite));
			}
			const currentSystem = getCurrentSystem(getState());
			sprites.planets = getPlanetsInSystem(currentSystem).map(planetData =>
				createAndPlacePlanet(game, planetData)
			);
			sprites.planets.map(sprite => game.mainContainer.addChild(sprite));

			if (sprites.stars) {
				sprites.stars.map(sprite => game.mainContainer.removeChild(sprite));
			}
			sprites.stars = getStarsInSystem(currentSystem).map(starData =>
				createAndPlaceStar(game, starData)
			);
			sprites.stars.map(sprite => game.mainContainer.addChild(sprite));

			if (sprites.gates) {
				sprites.gates.map(gate => game.mainContainer.removeChild(gate));
			}
			sprites.gates = getGatesInSystem(currentSystem).map(gateData =>
				createAndPlaceGate(game, gateData)
			);
			sprites.gates.map(sprite => game.mainContainer.addChild(sprite));

			sortSpritesByZIndex(game);
		}
		lastRenderedSystem = getCurrentSystem(getState());
		moveSpritesForPlayerPosition(sprites.planets, playerPosition);
		moveSpritesForPlayerPosition(sprites.stars, playerPosition);
		moveSpritesForPlayerPosition(sprites.gates, playerPosition);

		// render other ships
		const otherShipsToCreate = getOtherShipsToCreate(sprites.ships, getState());
		if (otherShipsToCreate.length) {
			debug('creating ships', otherShipsToCreate);
			sprites.ships = [
				...sprites.ships,
				...createAndPlaceOtherShips(game, otherShipsToCreate, playerPosition),
			];
		}
		if (!isDialogVisible()) {
			sprites.ships.forEach(other => {
				const shipData = getShipDataForId(getState(), other.shipId);
				if (!shipData) {
					throw new Error(`No ship data found when moving ship id ${other.shipId}`);
				}
				moveOtherShipForBehavior({
					game,
					getState,
					showDialog,
					shipSprite: other,
					shipData,
					playerSprite: sprites.ship,
					handleAction,
				});
				other.positionInSpace = shipData.positionInSpace;
			});
			moveSpritesForPlayerPosition(sprites.ships, playerPosition);
		}

		// render background
		setTilePosition(sprites.sky, playerPosition);

		// render ring
		sprites.ring.rotation = sprites.ship.rotation;
		sprites.ring.visible = !getEvent(getState(), 'gameOver') && getControlMode() === 'pilot';

		// render mode pointer
		sprites.modeControls.changeSelectedOption(getControlMode());

		// render health bar
		sprites.healthMeter.innerBar.width =
			(sprites.healthMeter.outerBar.width / 100) * getHealthAmount(getState());

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
