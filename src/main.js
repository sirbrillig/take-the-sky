/* @format */

import createGame from './pixi-wrapper';
import { makeReducer, makeState } from './state';
import reducer from './state-reducer';
import { setUpKeyboardControls } from './controls';
import {
	createAndPlaceModeControls,
	createAndPlaceBackground,
	createAndPlaceShip,
	createAndPlaceNavigationRing,
	createAndPlaceHealthMeter,
	createAndPlaceChargeMeter,
	createAndPlaceDialog,
	getSpriteMover,
} from './sprites';
import renderGame from './render';

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

function initSprites(game) {
	return {
		sky: createAndPlaceBackground(game),
		dialog: createAndPlaceDialog(game),
		ship: createAndPlaceShip(game),
		ring: createAndPlaceNavigationRing(game),
		ships: [],
		healthMeter: createAndPlaceHealthMeter(game),
		chargeMeter: createAndPlaceChargeMeter(game),
		modeControls: createAndPlaceModeControls(game),
	};
}

function setUpGameObjects(game, state, actions) {
	const sprites = initSprites(game);
	setUpKeyboardControls(game, state, actions);
	return sprites;
}

function initGame() {
	const [getState, handleAction] = makeReducer(reducer);
	const changeCurrentSystem = system => handleAction({ type: 'CHANGE_SYSTEM', payload: system });
	const changePlayerPosition = ({ x, y }) =>
		handleAction({ type: 'CHANGE_PLAYER_POSITION', payload: { x, y } });
	const [getDialogKey, showDialog] = makeState(null);
	const [getDialogSelection, changeDialogSelection] = makeState(0);
	const isDialogVisible = () => !!getDialogKey();
	const [getChargeMeterAmount, setChargeMeterAmount] = makeState(0);
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
		getChargeMeterAmount,
		isDialogVisible,
		getDialogKey,
		getDialogSelection,
		getState,
	};
	const actions = {
		changeControlMode,
		changeSpeed,
		changePressingState,
		changeCurrentSystem,
		changePlayerPosition,
		setChargeMeterAmount,
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
