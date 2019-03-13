/* @format */
/* globals window, PIXI */

export default function createGame({ canvasWidth, canvasHeight, setupCallback, filesToLoad }) {
	const app = new PIXI.Application({ width: canvasWidth, height: canvasHeight });
	window.document.body.appendChild(app.view);
	app.renderer.backgroundColor = 0x000000;
	app.renderer.view.style.position = 'absolute';
	app.renderer.view.style.display = 'block';
	app.renderer.autoResize = true;
	app.renderer.resize(window.innerWidth, window.innerHeight);

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
		app.group = () => new PIXI.Container();
		app.tilingSprite = (key, width, height) =>
			new PIXI.extras.TilingSprite(resources[key].texture, width, height);
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
