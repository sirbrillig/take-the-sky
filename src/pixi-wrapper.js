/* @format */
/* globals window, PIXI */

export default function createGame({ gameWidth, gameHeight, setupCallback, filesToLoad }) {
	const app = new PIXI.Application({ width: gameWidth, height: gameHeight });
	window.document.body.appendChild(app.view);

	app.gameWidth = gameWidth;
	app.gameHeight = gameHeight;

	app.renderer.backgroundColor = 0x000000;
	app.renderer.view.style.position = 'absolute';
	app.renderer.view.style.display = 'block';

	app.mainContainer = new PIXI.Container();
	app.stage.addChild(app.mainContainer);
	const scaleFactor = Math.min(window.innerWidth / gameWidth, window.innerHeight / gameHeight);
	const newWidth = Math.ceil(gameWidth * scaleFactor);
	const newHeight = Math.ceil(gameHeight * scaleFactor);
	app.renderer.view.style.width = `${newWidth}px`;
	app.renderer.view.style.height = `${newHeight}px`;
	app.renderer.resize(newWidth, newHeight);
	app.mainContainer.scale.set(scaleFactor);

	PIXI.loader.add(filesToLoad).load((loader, resources) => {
		app.resources = resources;
		app.sprite = key => new PIXI.Sprite(resources[key].texture);
		app.text = (textString, style) => new PIXI.Text(textString, style);
		app.circle = (diameter, color) => {
			const shape = new PIXI.Graphics();
			shape.beginFill(color);
			shape.drawCircle(0, 0, diameter / 2);
			shape.width = diameter;
			shape.height = diameter;
			shape.endFill();
			return shape;
		};
		app.rectangle = (width, height, fillColor, lineColor = 0, lineWidth = 0) => {
			const shape = new PIXI.Graphics();
			shape.lineStyle(lineWidth, lineColor);
			shape.beginFill(fillColor);
			shape.drawRect(0, 0, width, height);
			shape.endFill();
			shape.lineStyle();
			return shape;
		};
		app.line = (startVector, endVector, lineColor = 0, lineWidth = 2) => {
			const shape = new PIXI.Graphics();
			shape.lineStyle(lineWidth, lineColor);
			shape.moveTo(startVector.x, startVector.y);
			shape.lineTo(endVector.x, endVector.y);
			shape.lineStyle();
			return shape;
		};
		app.group = () => new PIXI.Container();
		app.tilingSprite = (key, width, height) =>
			new PIXI.extras.TilingSprite(resources[key].texture, width, height);
		app.animatedSpriteFromSpriteSheet = spritesheet => {
			const sheet = PIXI.loader.resources[spritesheet].spritesheet;
			return new PIXI.extras.AnimatedSprite(sheet.animations.explosion);
		};
		app.animatedSpriteFromImages = images => {
			return new PIXI.extras.AnimatedSprite(
				images.map(image => {
					return PIXI.Texture.fromImage(image);
				})
			);
		};
		setupCallback(app, loader, resources);
	});
	return app;
}
