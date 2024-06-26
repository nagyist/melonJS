import { describe, expect, it } from "vitest";
import { ObservableVector3d, Vector3d, math } from "../src/index.js";

describe("ObservableVector3d", () => {
	const x = 1;
	const y = 2;
	const z = 3;

	let a;
	let b;
	let c;
	let d;

	let _newX;
	let _newY;
	let _newZ;
	let _oldX;
	let _oldY;
	let _oldZ;

	const callback = function (newX, newY, newZ, oldX, oldY, oldZ) {
		// this will also validate the argument list
		_newX = newX;
		_newY = newY;
		_newZ = newZ;
		_oldX = oldX;
		_oldY = oldY;
		_oldZ = oldZ;
	};

	const callback_with_ret = function () {
		return {
			x: 10,
			y: 10,
			z: 10,
		};
	};

	it("should be initialized to a (0, 0, 0) 3d vector", function () {
		a = new ObservableVector3d(0, 0, 0, {
			onUpdate: callback.bind(this),
		});
		b = new ObservableVector3d(x, 0, 0, {
			onUpdate: callback.bind(this),
		});
		c = new ObservableVector3d(x, y, 0, {
			onUpdate: callback.bind(this),
		});

		d = new ObservableVector3d(x, y, z, {
			onUpdate: callback.bind(this),
		});

		expect(a.toString()).toEqual("x:0,y:0,z:0");
	});

	it("setting the vector triggers the callback", () => {
		a.set(10, 100, 20);

		expect(a.x + a.y + a.z).toEqual(_newX + _newY + _newZ);
	});

	it("callback returns a vector value", function () {
		const d = new ObservableVector3d(0, 0, 0, {
			onUpdate: callback_with_ret.bind(this),
		});
		d.set(100, 100, 100);
		expect(d.x + d.y + d.z).toEqual(30); // 10 + 10 + 10
	});

	it("add a vector triggers the callback", () => {
		a.add(new Vector3d(10, 10, 10));

		expect(a.y).toEqual(_oldY + 10);
	});

	it("sub a vector triggers the callback", () => {
		a.sub(new Vector3d(10, 10, 10));

		expect(a.x).toEqual(_oldX - 10);
	});

	it("scale a vector triggers the callback", () => {
		a.scaleV(new Vector3d(10, 10, 10));

		expect(a.x).toEqual(_oldX * 10);
		expect(a.y).toEqual(_oldY * 10);
		expect(a.z).toEqual(_oldZ * 10);
	});

	it("negate (1, 2, 3)", () => {
		a.set(x, y, z);

		expect(a.negateSelf().toString()).toEqual(
			"x:" + -x + ",y:" + -y + ",z:" + -z,
		);
	});

	it("dot Product (1, 2, 3) and (-1, -2, -3)", () => {
		a.set(x, y, z);
		b.set(-x, -y, -z);

		// calculate the dot product
		expect(a.dot(b)).toEqual(-x * x - y * y - z * z);
	});

	it("cross Product (2, 3, 4) and (5, 6, 7)", () => {
		a.set(2, 3, 4);
		b.set(5, 6, 7);

		const crossed = new Vector3d(-3, 6, -3);

		// calculate the cross product
		a.cross(b);
		expect(Math.abs(a.x - crossed.x)).toBeCloseTo(0, 4);
		expect(Math.abs(a.y - crossed.y)).toBeCloseTo(0, 4);
		expect(Math.abs(a.z - crossed.z)).toBeCloseTo(0, 4);
	});

	it("length/lengthSqrt functions", () => {
		a.set(x, 0, 0);
		b.set(0, -y, 0);
		c.set(0, 0, z);
		d.set(0, 0, 0);

		expect(a.length()).toEqual(x);
		expect(a.length2()).toEqual(x * x);
		expect(b.length()).toEqual(y);
		expect(b.length2()).toEqual(y * y);
		expect(c.length()).toEqual(z);
		expect(c.length2()).toEqual(z * z);
		expect(d.length()).toEqual(0);
		expect(d.length2()).toEqual(0);

		a.set(x, y, z);

		expect(a.length()).toEqual(Math.sqrt(x * x + y * y + z * z));
		expect(a.length2()).toEqual(x * x + y * y + z * z);
	});

	it("lerp functions", () => {
		a.set(x, 0, z);
		b.set(0, -y, 0);

		expect(a.clone().lerp(a, 0).equals(a.lerp(a, 0.5))).toEqual(true);
		expect(a.clone().lerp(a, 0).equals(a.lerp(a, 1))).toEqual(true);

		expect(a.clone().lerp(b, 0).equals(a)).toEqual(true);

		expect(a.clone().lerp(b, 0.5).x).toEqual(x * 0.5);
		expect(a.clone().lerp(b, 0.5).y).toEqual(-y * 0.5);
		expect(a.clone().lerp(b, 0.5).z).toEqual(z * 0.5);

		expect(a.clone().lerp(b, 1).equals(b)).toEqual(true);
	});

	it("normalize function", () => {
		a.set(x, 0, 0);
		b.set(0, -y, 0);
		c.set(0, 0, z);

		a.normalize();
		expect(a.length()).toEqual(1);
		expect(a.x).toEqual(1);

		b.normalize();
		expect(b.length()).toEqual(1);
		expect(b.y).toEqual(-1);

		c.normalize();
		expect(c.length()).toEqual(1);
		expect(c.z).toEqual(1);
	});

	it("distance function", () => {
		a.set(x, 0, 0);
		b.set(0, -y, 0);
		c.set(0, 0, z);
		d.set(0, 0, 0);

		expect(a.distance(d)).toEqual(x);
		expect(b.distance(d)).toEqual(y);
		expect(c.distance(d)).toEqual(z);
	});

	it("min/max/clamp", () => {
		a.set(x, y, z);
		b.set(-x, -y, -z);
		c.set(0, 0, 0);

		c.copy(a).minV(b);
		expect(c.x).toEqual(-x);
		expect(c.y).toEqual(-y);
		expect(c.z).toEqual(-z);

		c.copy(a).maxV(b);
		expect(c.x).toEqual(x);
		expect(c.y).toEqual(y);
		expect(c.z).toEqual(z);

		c.set(-2 * x, 2 * x, 2 * z);
		c.clampSelf(-x, x);
		expect(c.x).toEqual(-x);
		expect(c.y).toEqual(x);
		expect(c.z).toEqual(x);
	});

	it("ceil/floor", () => {
		expect(
			a
				.set(-0.1, 0.1, 0.3)
				.floorSelf()
				.equals(new Vector3d(-1, 0, 0)),
		).toEqual(true);
		expect(
			a
				.set(-0.5, 0.5, 0.6)
				.floorSelf()
				.equals(new Vector3d(-1, 0, 0)),
		).toEqual(true);
		expect(
			a
				.set(-0.9, 0.9, 0.8)
				.floorSelf()
				.equals(new Vector3d(-1, 0, 0)),
		).toEqual(true);

		expect(
			a
				.set(-0.1, 0.1, 0.3)
				.ceilSelf()
				.equals(new Vector3d(0, 1, 1)),
		).toEqual(true);
		expect(
			a
				.set(-0.5, 0.5, 0.6)
				.ceilSelf()
				.equals(new Vector3d(0, 1, 1)),
		).toEqual(true);
		expect(
			a
				.set(-0.9, 0.9, 0.9)
				.ceilSelf()
				.equals(new Vector3d(0, 1, 1)),
		).toEqual(true);
	});

	it("project a on b", () => {
		a.set(x, y, z);
		b.set(-x, -y, -z);

		// the following only works with (-)1, (-)2, (-)3 style of values
		expect(a.project(b).equals(b)).toEqual(true);
	});

	it("angle between a and b", () => {
		a.set(0, -0.18851655680720186, 0.9820700116639124);
		b.set(0, 0.18851655680720186, -0.9820700116639124);

		expect(a.angle(a)).toEqual(0);
		expect(a.angle(b)).toEqual(Math.PI);

		a.set(x, y, 0);
		b.set(-x, -y, 0);

		// why is this not perfectly 180 degrees ?
		expect(math.round(math.radToDeg(a.angle(b)))).toEqual(180);

		b.set(4 * x, -y, 0);
		expect(a.angle(b)).toEqual(Math.PI / 2);
	});

	it("perp and rotate function", () => {
		a.set(x, y, z);
		b.copy(a).perp();
		// perp rotate the vector by 90 degree clockwise on the z axis
		c.copy(a).rotate(Math.PI / 2);

		expect(a.angle(b)).toEqual(a.angle(c));
	});
});
