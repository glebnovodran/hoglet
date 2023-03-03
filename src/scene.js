/* SPDX-License-Identifier: MIT */
/* SPDX-FileCopyrightText: 2023 Glib Novodran <novodran@gmail.com> */

class SCENE {
	constructor() {
	}

	init(mdls) {
		this.models = {};
		if (mdls) {
			for (const entry of mdls) {
				this.loadModel(entry.name, entry.str);
			}
		}
		const w = drawWebGL2.canvas.width;
		const h = drawWebGL2.canvas.height;
		this.cam = new Camera(w, h);
		this.drawCtx = new DrawContext();
		this.drawCtx.cam = this.cam;
	}

	loadModel(name, jsonStr) {
		console.log("Loading ", name);
		if (!this.models[name]) {
			const jsonObj = JSON.parse(jsonStr);
			var mdl = new Model(jsonObj);
			this.models[name] = mdl;
		} else {
			console.log("Model ", name, " is already loaded");
		}

		return this.models[name];
	}

	exec() {

	}

	draw() {
		for (const mdl in this.models) {
			mdl.draw(this.drawCtx);
		}
	}

}

const scene = new SCENE();
