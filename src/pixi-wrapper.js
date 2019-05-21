/* @format */
/* globals window, PIXI */

import Game from './game';

export default function createGame({ gameWidth, gameHeight, setupCallback, filesToLoad }) {
	const app = new PIXI.Application({ width: gameWidth, height: gameHeight });
	window.document.body.appendChild(app.view);

	app.gameWidth = gameWidth;
	app.gameHeight = gameHeight;

	app.renderer.backgroundColor = 0x000000;
	app.renderer.view.style.position = 'absolute';
	app.renderer.view.style.display = 'block';

	const loaderPromise = new Promise(resolve => {
		PIXI.loader.add(filesToLoad).load((loader, resources) => {
			resolve({ loader, resources });
		});
	});
	loaderPromise.then(({ loader, resources }) => {
		const game = new Game(PIXI, app, resources);
		const scaleFactor = Math.min(window.innerWidth / gameWidth, window.innerHeight / gameHeight);
		const newWidth = Math.ceil(gameWidth * scaleFactor);
		const newHeight = Math.ceil(gameHeight * scaleFactor);
		app.renderer.view.style.width = `${newWidth}px`;
		app.renderer.view.style.height = `${newHeight}px`;
		app.renderer.resize(newWidth, newHeight);
		game.mainContainer.scale.set(scaleFactor);
		setupCallback(game, loader, resources);
	});
}
