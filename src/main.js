/* @format */

import createGame from './pixi-wrapper';
import { makeReducer, makeState } from './state';
import { getPlayerPosition } from './selectors';
import reducer from './state-reducer';
import { setUpKeyboardControls } from './controls';
import {
	createAndPlaceModeControls,
	createAndPlaceBackground,
	createAndPlacePlayer,
	createAndPlaceNavigationRing,
	createAndPlaceHealthMeter,
	createAndPlaceChargeMeter,
	createAndPlaceDialog,
	getSpriteMover,
} from './sprites';
import renderGame from './render';
import { adjustRotationForDirection } from './math';

const canvasWidth = 800;
const canvasHeight = 600;
const filesToLoad = [
	'assets/player-idle.png',
	'assets/cruiser.png',
	'assets/sun.png',
	'assets/planet-1.png',
	'assets/star-field.png',
	'assets/nav-ring.png',
	'assets/pointer.png',
	'assets/bolt-red.png',
	'assets/explosion.json',
];

function initSprites(game, state) {
	const { getState } = state;
	return {
		sky: createAndPlaceBackground(game),
		dialog: createAndPlaceDialog(game),
		player: createAndPlacePlayer(game, getPlayerPosition(getState())),
		ring: createAndPlaceNavigationRing(game, getPlayerPosition(getState())),
		ships: [],
		movingObjects: [],
		healthMeter: createAndPlaceHealthMeter(game),
		chargeMeter: createAndPlaceChargeMeter(game),
		modeControls: createAndPlaceModeControls(game),
	};
}

class Input {
	constructor({ currentKeyDown, currentKeyUp }) {
		this.currentKeyDown = currentKeyDown;
		this.currentKeyUp = currentKeyUp;
	}
}

class SpaceThing {
	constructor({ game }) {
		this.game = game;
		this.id = null;
		this.sprite = null;
		this.position = null;
		this.rotation = null;
		this.isDestroyed = false;
		this.state = null;
	}

	handleInput(input) {
		if (!this.state) {
			return;
		}
		const newState = this.state.handleInput(this, input);
		if (newState) {
			this.state = newState;
		}
	}

	update() {
		this.state && this.state.update(this);
	}
}

class Player extends SpaceThing {
	constructor(props) {
		super(props);
		this.state = new DriftingState();
	}
}

class AcceleratingState {
	handleInput() {}

	update() {}
}

class DriftingState {
	handleInput(thing, input) {
		if (input.currentKeyDown.code === 'KeyW') {
			return new AcceleratingState();
		}
		if (input.currentKeyDown.code === 'KeyD') {
			thing.rotation = adjustRotationForDirection(thing.rotation, 'clockwise', thing.rotationRate);
			return;
		}
		if (input.currentKeyDown.code === 'KeyA') {
			thing.rotation = adjustRotationForDirection(
				thing.rotation,
				'counterclockwise',
				thing.rotationRate
			);
		}
	}

	update(thing) {
		thing.sprite.rotation = thing.rotation;
	}
}

class Background extends SpaceThing {}

function initThings(game) {
	return [new Player({ game }), new Background({ game })];
}

function update(things) {
	things.map(thing => thing.update());
}

function handleInput(things, input) {
	things.map(thing => thing.handleInput(input));
}

function initInput() {
	let currentKeyDown = null;
	let currentKeyUp = null;
	const onKeyDown = event => (currentKeyDown = event); // eslint-disable-line no-return-assign
	const onKeyUp = event => (currentKeyUp = event); // eslint-disable-line no-return-assign

	window.document.addEventListener('keydown', onKeyDown); // eslint-disable-line no-undef
	window.document.addEventListener('keyup', onKeyUp); // eslint-disable-line no-undef

	return function getInput() {
		return new Input({ currentKeyDown, currentKeyUp });
	};
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
		const things = initThings(game);
		const getInput = initInput();
		game.ticker.add(() => {
			const input = getInput();
			handleInput(things, input);
			update(things);
		});
	};
	createGame({ canvasWidth, canvasHeight, filesToLoad, setupCallback });
}

initGame();
