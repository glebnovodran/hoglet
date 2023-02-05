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
		return (this.set(0.0, 0.0, 0.0));
	}

	static zero() {
		var res = new Vec3();
		res.zero();
		return res;
	}

	copy(v) {
		for (let i = 0; i < 3; ++i) {
			this.el[i] = v.el[i];
		}
		return this;
	}

	static copy(v) {
		return (new Vec3()).copy(v);
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
		return Vec3.copy(v).scl(s);
	}

	neg(v) {
		const el = v ? v.el : this.el;
		for (let i = 0; i < 3; ++i) {
			this.el[i] = - el[i];
		}
		return this;
	}

	static neg(v) {
		return Vec3.copy(v).neg();
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
			this.copy(v);
		}

		const m = this.mag;
		if (m > 0) {
			this.scl(1.0 / m);
		}
		return this;
	}

	static normalize(v) {
		return Vec3.copy(v).normalize();
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
}