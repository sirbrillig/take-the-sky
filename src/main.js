/* @format */

import createGame from './pixi-wrapper';
import { adjustSpeedForRotation, adjustRotation } from './math';
import { makeReducer, makeState } from './state';
import reducer from './state-reducer';
import { setUpKeyboardControls, getTurningDirectionFromPressingState } from './controls';
import {
	createAndPlaceModeButton,
	createAndPlaceModePointer,
	createAndPlaceBackground,
	createAndPlaceShip,
	createAndPlaceNavigationRing,
	createAndPlaceHealthMeter,
	createAndPlaceChargeMeter,
	createAndPlaceDialog,
	setSpriteRotation,
	getSpriteRotation,
	getSpriteMover,
	isShipTouchingStar,
	isShipTouchingPlanet,
	isShipTouchingGate,
	isChargeMeterFull,
	explodeShip,
} from './sprites';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/gate.png',
	'assets/ship.png',
	'assets/ship-2.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/pointer.png',
];

function updateSystemPositionFromSpeed(state, actions) {
	const { getSpeed, getSystemPosition } = state;
	const { changeSystemPosition } = actions;
	const speed = getSpeed();
	const system = getSystemPosition();
	changeSystemPosition({ x: system.x + speed.x, y: system.y + speed.y });
}

function renderGame(game, sprites, state, actions, moveSprites) {
	const { ship, ring } = sprites;
	const {
		getPressingState,
		getSpeed,
		getControlMode,
		getChargeMeterAmount,
		getHealthAmount,
		getEvent,
		isDialogVisible,
	} = state;
	const {
		changeSpeed,
		changeCurrentSystem,
		setChargeMeterAmount,
		setHealthAmount,
		showDialog,
	} = actions;
	const pressing = getPressingState();

	if (isDialogVisible()) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return; // freeze the game if the dialog is showing
	}

	if (getEvent('gameOver')) {
		setChargeMeterAmount(0);
		moveSprites(sprites, state, actions);
		return;
	}

	if (isShipTouchingStar(sprites) && !getEvent('starsAreHot')) {
		changeSpeed({ x: 0, y: 0 });
		showDialog('starsAreHot');
		return;
	}
	if (isShipTouchingStar(sprites) && getHealthAmount() > 0) {
		setHealthAmount(getHealthAmount() - 1);
	}

	if (getHealthAmount() < 1) {
		ship.visible = false;
		explodeShip(game);
		showDialog('explodedShip');
		return;
	}

	if (
		getControlMode() === 'land' &&
		isChargeMeterFull(getChargeMeterAmount()) &&
		isShipTouchingPlanet(sprites)
	) {
		setChargeMeterAmount(0);
		changeSpeed({ x: 0, y: 0 });
		showDialog('firstLanding1');
	}

	if (
		getControlMode() === 'jump' &&
		isChargeMeterFull(getChargeMeterAmount()) &&
		isShipTouchingGate(sprites)
	) {
		setChargeMeterAmount(0);
		if (getEvent('firstLanding')) {
			changeCurrentSystem('Betan');
		} else {
			showDialog('firstLandingNotDone');
		}
	}

	if (pressing.up) {
		switch (getControlMode()) {
			case 'pilot':
				changeSpeed(adjustSpeedForRotation(getSpriteRotation(ship), getSpeed()));
				break;
			case 'land':
				if (getChargeMeterAmount() < 100) {
					setChargeMeterAmount(getChargeMeterAmount() + 1.0);
				}
				break;
			case 'jump':
				if (getChargeMeterAmount() < 100) {
					setChargeMeterAmount(getChargeMeterAmount() + 1.0);
				}
				break;
			default:
			// noop
		}
	}

	if (!pressing.up && getChargeMeterAmount() > 1) {
		setChargeMeterAmount(getChargeMeterAmount() - 0.2);
	}
	if (
		pressing.up &&
		getControlMode() !== 'land' &&
		getControlMode() !== 'jump' &&
		getChargeMeterAmount() > 1
	) {
		setChargeMeterAmount(getChargeMeterAmount() - 0.2);
	}

	if (getControlMode() === 'pilot' && (pressing.left || pressing.right)) {
		setSpriteRotation(
			ship,
			adjustRotation(getTurningDirectionFromPressingState(pressing), getSpriteRotation(ship))
		);
	}

	setSpriteRotation(ring, getSpriteRotation(ship));

	updateSystemPositionFromSpeed(state, actions);

	moveSprites(sprites, state, actions);
}

function initSprites(game) {
	return {
		sky: createAndPlaceBackground(game),
		dialog: createAndPlaceDialog(game),
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		healthMeter: createAndPlaceHealthMeter(game),
		chargeMeter: createAndPlaceChargeMeter(game),
		pilotModeButton: createAndPlaceModeButton(game, 'pilot', 1),
		landModeButton: createAndPlaceModeButton(game, 'land', 2),
		jumpModeButton: createAndPlaceModeButton(game, 'jump', 3),
		modePointer: createAndPlaceModePointer(game),
	};
}

function setUpGameObjects(game, state, actions) {
	const sprites = initSprites(game);
	setUpKeyboardControls(game, state, actions);
	return sprites;
}

function initGame() {
	const [getState, handleAction] = makeReducer(reducer, {
		currentSystem: 'Algol',
		position: {
			x: 100,
			y: 100,
		},
		events: {
			firstLanding: false,
			gameOver: false,
		},
	});
	const getCurrentSystem = () => getState().currentSystem;
	const changeCurrentSystem = system => handleAction({ type: 'CHANGE_SYSTEM', payload: system });
	const getSystemPosition = () => getState().position;
	const changeSystemPosition = ({ x, y }) =>
		handleAction({ type: 'CHANGE_SYSTEM_POSITION', payload: { x, y } });
	const getEvent = key => getState().events[key];
	const [getDialogKey, showDialog] = makeState(null);
	const [getDialogSelection, changeDialogSelection] = makeState(0);
	const isDialogVisible = () => !!getDialogKey();
	const [getChargeMeterAmount, setChargeMeterAmount] = makeState(0);
	const [getHealthAmount, setHealthAmount] = makeState(100);
	const [getSpeed, changeSpeed] = makeState({ x: 0, y: 0 });
	const [getPressingState, changePressingState] = makeState({
		up: false,
		down: false,
		left: false,
		right: false,
		ring: false,
	});
	const [getControlMode, changeControlMode] = makeState('pilot');
	const state = {
		getControlMode,
		getPressingState,
		getSpeed,
		getCurrentSystem,
		getSystemPosition,
		getChargeMeterAmount,
		getHealthAmount,
		getEvent,
		isDialogVisible,
		getDialogKey,
		getDialogSelection,
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		changeSystemPosition,
		setChargeMeterAmount,
		setHealthAmount,
		handleAction,
		showDialog,
		changeDialogSelection,
	};
	const setupCallback = game => {
		const sprites = setUpGameObjects(game, state, actions);
		const moveSprites = getSpriteMover(game);
		game.ticker.add(() => renderGame(game, sprites, state, actions, moveSprites));
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
