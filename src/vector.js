/* @format */

/*
 * @class Vector
 * @source https://github.com/pixijs/pixi.js/issues/403#issue-22799532
 * @constructor
 * @param x {Number} position of the point
 * @param y {Number} position of the point
 */
export default class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Creates a clone of this point
	 *
	 * @method clone
	 * @return {Vector} a copy of the point
	 */
	clone() {
		return new Vector(this.x, this.y);
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	sub(v) {
		const copy = this.clone();
		copy.x -= v.x;
		copy.y -= v.y;
		return copy;
	}

	invert() {
		const copy = this.clone();
		copy.x *= -1;
		copy.y *= -1;
		return copy;
	}

	multiplyScalar(s) {
		const copy = this.clone();
		copy.x *= s;
		copy.y *= s;
		return copy;
	}

	divideScalar(s) {
		const copy = this.clone();
		if (s === 0) {
			copy.x = 0;
			copy.y = 0;
		} else {
			const invScalar = 1 / s;
			copy.x *= invScalar;
			copy.y *= invScalar;
		}
		return copy;
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}

	normalize() {
		return this.divideScalar(this.length());
	}

	distanceTo(v) {
		return Math.sqrt(this.distanceToSq(v));
	}

	distanceToSq(v) {
		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return dx * dx + dy * dy;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	setX(x) {
		this.x = x;
		return this;
	}

	setY(y) {
		this.y = y;
		return this;
	}

	setLength(l) {
		const oldLength = this.length();
		if (oldLength !== 0 && l !== oldLength) {
			this.multiplyScalar(l / oldLength);
		}
		return this;
	}

	lerp(v, alpha) {
		const copy = this.clone();
		copy.x += (v.x - copy.x) * alpha;
		copy.y += (v.y - copy.y) * alpha;
		return copy;
	}

	rad() {
		return Math.atan2(this.x, this.y);
	}

	deg() {
		return (this.rad() * 180) / Math.PI;
	}

	equals(v) {
		return this.x === v.x && this.y === v.y;
	}

	rotate(theta) {
		const xtemp = this.x;
		this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
		this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
		return this;
	}

	magnitude() {
		const aSq = this.x * this.x;
		const bSq = this.y * this.y;
		return Math.sqrt(aSq + bSq);
	}

	toString() {
		return `(${this.x},${this.y})`;
	}
}
