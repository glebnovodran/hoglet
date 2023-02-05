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


}

const scene = new SCENE();
