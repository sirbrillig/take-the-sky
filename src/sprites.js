/* @format */
/* globals PIXI */

export function createAndPlaceBackground(game) {
	const sky = game.tilingSprite('assets/star-field.png', game.canvas.width, game.canvas.height);
	game.stage.addChild(sky);
	return sky;
}

export function createAndPlacePlanets(game) {
	const system = game.group();

	const planet = game.circle(50, 'blue');
	planet.x = 20;
	planet.y = 20;
	system.addChild(planet);

	const planet2 = game.circle(30, 'green');
	planet2.x = 90;
	planet2.y = 170;
	system.addChild(planet2);

	game.stage.addChild(system);
	return system;
}

export function createAndPlaceShip(game) {
	const ship = game.sprite('assets/ship.png');
	ship.rotation = Math.floor(Math.random() * Math.floor(360));
	ship.setPivot(0.5, 0.5);
	game.stage.putCenter(ship);
	return ship;
}

export function createAndPlaceNavigationRing(game) {
	const pixiCircle = new PIXI.Graphics();
	pixiCircle.clear();
	pixiCircle.lineStyle(6, 0x0000ff);
	pixiCircle.drawCircle(60, 60, 50);
	pixiCircle.endFill();
	const texture = pixiCircle.generateTexture();
	const sprite = new PIXI.Sprite(texture);
	game.stage.addChild(sprite);

	const nudgeAnchor = (o, value, axis) => {
		if (o.anchor !== undefined) {
			if (o.anchor[axis] !== 0) {
				return value * (1 - o.anchor[axis] - o.anchor[axis]);
			}
			return value;
		}
		return value;
	};

	let a = game.stage;
	const o = game.stage;
	const b = sprite;
	if (o._stage) {
		a = game.compensateForStageSize(o);
	}
	b.x = a.x + nudgeAnchor(a, a.halfWidth, 'x') - nudgeAnchor(b, 25, 'x') + 0;
	b.y = a.y + nudgeAnchor(a, a.halfHeight, 'y') - nudgeAnchor(b, 25, 'y') + 0;

	//Compensate for the parent's position
	if (!o._stage) {
		o.compensateForParentPosition(a, b);
	}

	return pixiCircle;
}
