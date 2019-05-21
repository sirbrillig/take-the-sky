/* @format */

export default class Game {
	constructor(PIXI, app, resources) {
		this.PIXI = PIXI;
		this.resources = resources;
		this.app = app; // PIXI.Application
		this.setUpMainContainer();
	}

	setUpMainContainer() {
		this.mainContainer = new this.PIXI.Container();
		this.app.stage.addChild(this.mainContainer);
	}

	sprite(key) {
		return new this.PIXI.Sprite(this.resources[key].texture);
	}

	text(textString, style) {
		return new this.PIXI.Text(textString, style);
	}

	circle(diameter, color) {
		const shape = new this.PIXI.Graphics();
		shape.beginFill(color);
		shape.drawCircle(0, 0, diameter / 2);
		shape.width = diameter;
		shape.height = diameter;
		shape.endFill();
		return shape;
	}

	rectangle(width, height, fillColor, lineColor = 0, lineWidth = 0) {
		const shape = new this.PIXI.Graphics();
		shape.lineStyle(lineWidth, lineColor);
		shape.beginFill(fillColor);
		shape.drawRect(0, 0, width, height);
		shape.endFill();
		shape.lineStyle();
		return shape;
	}

	line(startVector, endVector, lineColor = 0, lineWidth = 2) {
		const shape = new this.PIXI.Graphics();
		shape.lineStyle(lineWidth, lineColor);
		shape.moveTo(startVector.x, startVector.y);
		shape.lineTo(endVector.x, endVector.y);
		shape.lineStyle();
		return shape;
	}

	group() {
		return new this.PIXI.Container();
	}

	tilingSprite(key, width, height) {
		return new this.PIXI.extras.TilingSprite(this.resources[key].texture, width, height);
	}

	animatedSpriteFromSpriteSheet(spritesheet) {
		const sheet = this.PIXI.loader.resources[spritesheet].spritesheet;
		const animationName = Object.keys(sheet.animations)[0];
		return new this.PIXI.extras.AnimatedSprite(sheet.animations[animationName]);
	}

	animatedSpriteFromImages(images) {
		return new this.PIXI.extras.AnimatedSprite(
			images.map(image => {
				return this.PIXI.Texture.fromImage(image);
			})
		);
	}
}
