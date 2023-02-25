/* SPDX-License-Identifier: MIT */
/* SPDX-FileCopyrightText: 2023 Glib Novodran <novodran@gmail.com> */

class Camera {

	constructor(width, height) {
		this.setWindow(width, height);

		this.setFrame(
			Vec3.set(0.0, 0.0, 0.0),
			Vec3.set(0.0, 0.0, -1.0),
			Vec3.set(0.0, 1.0, 0.0)
		);

		this.setRange(0.1, 1000);

		this.zoom = 2.5;

		this.view = new Transform();
		this.proj = new Transform();
		this.viewProj = new Transform();
	}

	get aspect() { return div0(width, height); }

	get direction() { return Vec3.sub(this.tgt, this.pos).normalize(); }

	halfFOVY() { return Math.atan2(1.0, this.zoom * this.aspect); }

	setWindow(width, height) {
		this.width = width;
		this.height = height;
	}

	setFrame(pos, tgt, up) {
		this.pos = pos;
		this.tgt = tgt;
		this.up = up;
	}

	setRange(near, far) {
		this.near = near;
		this.far = far;
	}

	setZoom(focal, aperture) {
		this.zoom = ((2.0 * focal) / aperture) * this.aspect;
	}

	update() {
		this.view.makeView(this.pos, this.tgt, this.up);
		this.proj.makeProjection(this.halfFOVY());
		this.viewProj = Transform.concat(this.view, this.proj);
	}
}