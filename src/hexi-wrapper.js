/* @format */
/* globals hexi */

function load(game) {
	game.loadingBar();
}

export function createGame({ canvasWidth, canvasHeight, setupCallback, filesToLoad }) {
	const game = hexi(canvasWidth, canvasHeight, () => setupCallback(game), filesToLoad, () =>
		load(game)
	);
	return game;
}

export function scaleGameToWindow(game) {
	game.scaleToWindow();
}

export function setBackgroundColor(game, color) {
	game.backgroundColor = color;
}
