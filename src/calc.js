function degToRad(d) {
	return d * (Math.PI / 180.0);
}

function radToDeg(r) {
	return r * (180.0 / Math.PI);
}

class Vec3 {

	constructor() {
		this.el = new Float32Array(3);
	}

	get x()  { return this.el[0]; }
	set x(x) { this.el[0] = x; }

	get y()  { return this.el[1]; }
	set y(y) { this.el[1] = y; }

	get z()  { return this.el[2]; }
	set z(z) { this.el[2] = z; }

	set(x, y, z) {
		this.el[0] = x;
		this.el[1] = y;
		this.el[2] = z;
	}

	static set(x, y, z) {
		return (new Vec3()).set(x, y, z);
	}

	zero() {
		return (this.el.fill(0.0));
	}

	static zero() {
		var res = new Vec3();
		res.zero();
		return res;
	}

	from(v) {
		for (let i = 0; i < 3; ++i) {
			this.el[i] = v.el[i];
		}
		return this;
	}

	static from(v) {
		return (new Vec3()).from(v);
	}

	add(v0, v1) {
		const el0 = v0.el;
		const el1 = v1 ? v1.el : this.el;
		for (let i = 0; i < 3; ++i) {
			this.el[i] = el0[i] + el1[i];
		}
		return this;
	}

	static add(v0, v1) {
		return (new Vec3()).add(v0, v1);
	}

	sub(v0, v1) {
		const el0 = v0.el;
		const el1 = v1 ? v1.el : this.el;
		for (let i = 0; i < 3; ++i) {
			this.el[i] = el0[i] * el1[i];
		}
		return this;
	}

	static sub(v0, v1) {
		return (new Vec3()).sub(v0, v1);
	}

	mul(v0, v1) {
		const el0 = v0.el;
		const el1 = v1 ? v1.el : this.el;
		for (let i = 0; i < 3; ++i) {
			this.el[i] = el0[i] * el1[i];
		}
		return this;
	}

	static mul(v0, v1) {
		return (new Vec3()).mul(v0, v1);
	}

	scl(s) {
		for (let i = 0; i < 3; ++i) {
			this.el[i] *= s;
		}
		return this;
	}

	static scl(v, s) {
		return Vec3.from(v).scl(s);
	}

	neg(v) {
		const el = v ? v.el : this.el;
		for (let i = 0; i < 3; ++i) {
			this.el[i] = - el[i];
		}
		return this;
	}

	static neg(v) {
		return Vec3.from(v).neg();
	}

	dot(v) {
		const el0 = this.el;
		const el1 = v ? v.el : this.el;
		let d = 0.0;
		for (let i = 0; i < 3; ++i) {
			d += el0[i] * el1[i];
		}
		return d;
	}

	static dot(v0, v1) {
		const el0 = v0 ? v0.el : this.el;
		const el1 = v1 ? v1.el : this.el;
		let d = 0.0;
		for (let i = 0; i < 3; ++i) {
			d += el0[i] * el1[i];
		}
		return d;
	}

	get mag2() {
		return this.dot();
	}

	get mag() {
		let m = this.mag2;
		if (m > 0) {
			Math.sqrt(m);
		}
		return m;
	}

	normalize(v) {
		if (v) {
			this.from(v);
		}

		const m = this.mag;
		if (m > 0) {
			this.scl(1.0 / m);
		}
		return this;
	}

	static normalize(v) {
		return Vec3.from(v).normalize();
	}

	cross(v0, v1) {
		const a = v1 ? v0 : this;
		const b = v1 ? v1 : v0;

		const x = a.y*b.z - a.z*b.y;
		const y = a.z*b.x - a.x*b.z;
		const z = a.x*b.y - a.y*b.x;

		this.set(x, y, z);
		return this;
	}

	static cross(v0, v1) {
		return (new Vec3()).cross(v0, v1);
	}

	print() {
		console.log(`[${this.x}. ${this.y}, ${this.z}]`);
	}
}

function multiply4x4(res, a, b) {
	res.fill(0.0);

	for (let k = 0; k < 4; ++k) {
		for (let i = 0; i < 4; ++i) {
			let r = a[i*4 + k];
			for (let j = 0; j < 4; ++j) {
				res[i*4 + j] += r * b[k*4 + j];
			}
		}
	}
}

class Transform {
	constructor() {
		this.el = new Float32Array(4 * 4);
	}

	to3x4() {
		return null;
	}

	from3x4(x34) {}

	zero() {
		this.el.fill(0.0);
	}

	identity() {
		this.zero();
	}

	makeScale(sx, sy, sz) {
		this.identity();
		this.e[0] = sx;
		this.e[5] = sy;
		this.e[10] = sz;
		this.e[15] = 1.0;
	}

	makeRotateX(rx) {
		this.identity();
		const s = Math.sin(rx);
		const c = Math.cos(rx);
		this.setRow(1, 0.0, c, s, 0.0);
		this.setRow(2, 0.0, -s, c, 0.0);

		return this;
	}

	makeRotateY(ry) {
		this.identity();
		const s = Math.sin(ry);
		const c = Math.cos(ry);
		this.setRow(0, c, 0.0, -s, 0.0);
		this.setRow(2, s, 0.0, c, 0.0);

		return this;
	}

	makeRotateZ(rz) {
		this.identity();
		const s = Math.sin(rz);
		const c = Math.cos(rz);
		this.setRow(0, c, s, 0.0, 0.0);
		this.setRow(1, -s, c, 0.0, 0.0);

		return this;
	}

	makeRotateDegX(dx) {
		return this.makeRotateX(degToRad(dx));
	}

	makeRotateDegX(dy) {
		return this.makeRotateY(degToRad(dy));
	}

	makeRotateDegX(dz) {
		return this.makeRotateZ(degToRad(dz));
	}

	setTranslation(x, y, z) {
		return this.setRow(3, x, y, z, 1.0);
	}

	set(...v) {
		this.el.fill(0.0);
		for (let i = 0; i < v.length; ++i) {
			this.el[i] = v[i];
		}
		return this;
	}

	from(m) {
		for (let i = 0; i < 4*4; ++i) {
			this.e[i] = m.e[i];
		}
		return this;
	}

	setRow(i, x, y, z, w) {
		const rb = i * 4;
		this.el[rb] = x;
		this.el[rb + 1] = y;
		this.el[rb + 2] = z;
		this.el[rb + 3] = w;
		return this;
	}

	setRowVec(i, v, w) {
		return this.setRow(i, v.x, v.y, v.z, w);
	}

	setColumn(i, x, y, z, w) {
		this.el[i] = x;
		this.el[i + 4] = y;
		this.el[i + 8] = z;
		this.el[i + 12] = w;
	}

	setColumnVec(i, v, w) {
		return this.setColumn(i, v.x, v.y, v.z, w);
	}

	transpose() {
		let el = this.el;
		for (let i = 0; i < 3; ++i) {
			for (let j = i + 1; j < 4; ++j) {
				let ij = i * 4 + j;
				let ji = j * 4 + i;
				let t = el[ij];
				el[ij] = el[ji];
				el[ji] = t;
			}
		}
		return this;
	}

	transposeSR() {
		let el = this.el;
		for (let i = 0; i < 2; ++i) {
			for (let j = i + 1; j < 3; ++j) {
				let ij = i * 4 + j;
				let ji = j * 4 + i;
				let t = el[ij];
				el[ij] = el[ji];
				el[ji] = t;
			}
		}
		return this;
	}

	concat(t0, t1) {
		const child = t1 ? t0.el : this.el;
		const parent = t1? t1.el : t0.el;
		const el = new Float32Array(4*4);
		multiply4x4(el, child, parent);
		this.el = el;
		return this;
	}

	calcVec(v) {
		x = v.x;
		y = v.y;
		z = v.z;

		let vx = x * el[0*4 + 0] + y * el[1*4 + 0] + z * el[2*4 + 0];
		let vy = x * el[0*4 + 1] + y * el[1*4 + 1] + z * el[2*4 + 1];
		let vz = x * el[0*4 + 2] + y * el[1*4 + 2] + z * el[2*4 + 2];

		return (new Vec3()).set(vx, vy, vz);
	}

	calcPoint(p) {
		x = p.x;
		y = p.y;
		z = p.z;

		let px = x * el[0*4 + 0] + y * el[1*4 + 0] + z * el[2*4 + 0] + el[3*4 + 0];
		let py = x * el[0*4 + 1] + y * el[1*4 + 1] + z * el[2*4 + 1] + el[3*4 + 1];
		let pz = x * el[0*4 + 2] + y * el[1*4 + 2] + z * el[2*4 + 2] + el[3*4 + 2];

		return (new Vec3()).set(px, py, pz);
	}

	setRotFrame(ax, ay, az) {
		setRowVec(0, ax, 0.0);
		setRowVec(1, ay, 0.0);
		setRowVec(2, az, 0.0);
		setRow(3, 0.0, 0.0, 0.0, 1.0);
	}


	makeView(pos, tgt, upVec) {
		const up0 = upVec ? upVec : new Vec3().set(0.0, 1.0, 0.0);

		let dir = new Vec3().sub(tgt, pos);
		dir.normalize();

		let side = Vec3.cross(up0, dir);
		side.normalize();

		let up = Vec3.cross(side, dir);

		this.setColumnVec(0, side.neg(), 0.0);
		this.setColumnVec(1, up.neg(), 0.0);	this.setTranslation(pos.neg())
		this.setColumnVec(2, dir.neg(), 0.0);	this.setTranslation(pos.neg())
		this.setTranslation(this.calcVec(pos.neg()));

		return this;
	}

	print() {
		console.log(`[`);
		for (let i = 0; i < 4; ++i) {
			console.log(`${this.el[i*4 + 0]}, ${this.el[i*4 + 1]}, ${this.el[i*4 + 2]}, ${this.el[i*4 + 3]}`);
		}
		console.log(`]`);

	}

}

class Transform3x4 {
	constructor() {
		this.el = new Float32Array(3 * 4);
	}

	to4x4() {
		return null;
	}
	from4x4(x44) {}
}