function compileShader(src, type) {
	let s = null;
	const gl = drawWebGL2.gl;
	if (gl && src) {
		s = gl.createShader(type);
		if (s) {
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				console.log(gl.getShaderInfoLog(s));
				gl.deleteShader(s);
				s = null;
			}
		}
	}
	return s;
}

function compileVertShader(src) {
	const gl = drawWebGL2.gl;
	return gl ? compileShader(src, gl.VERTEX_SHADER) : null;
}

function compileFragShader(src) {
	const gl = drawWebGL2.gl;
	return compileShader(src, gl.FRAGMENT_SHADER);
}

function validAttr(location) {
	return (typeof location === "number") && (location >= 0);
}

class GPUProg {
	constructor(progInfo) {
		this.vert = null;
		this.frag = null;
		this.prog = null;
		this.nattr = 0;
		this.nparm = 0;
		this.nsamp = 0;

		const gl = drawWebGL2.gl;

		if (gl && progInfo) {
			this.vert = drawWebGL2.shaders[progInfo.vs.name];
			if (this.vert == null) {
				this.vert = compileVertShader(progInfo.vs.src);
				if (this.vert) {
					drawWebGL2.shaders[progInfo.vs.name] = this.vert;
				}
			}

			this.frag = drawWebGL2.shaders[progInfo.vs.name];
			if (this.frag == null) {
				this.frag = compileVertShader(progInfo.fs.src)
				if (this.frag) {
					drawWebGL2.shaders[progInfo.fs.name] = this.frag;
				}
			}

			if (this.vert && this.frag) {
				this.prog = gl.createProgram();
				if (this.prog) {
					gl.attachShader(this.prog, this.vert);
					gl.attachShader(this.prog, this.frag);
					gl.linkProgram(this.prog);
					if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
						console.log("Error linking GPU program:");
						console.log(gl.getProgramInfoLog(this.prog));
						gl.deleteProgram(this.prog);
						this.prog = null;
					} else {
						this.vert = vs;
						this.frag = fs;
						this.nattr = progInfo.attrs.length;
						this.nparm = progInfo.uniforms.length;
						this.nsamp = progInfo.samplers.length;

						for (const attr of progInfo.attrs) {
							this[`locAttr${attr}`] = gl.getAttribLocation(this.prog, `vtx${attr}`);
						}

						for (const parm in progInfo.uniforms) {
							this[`parmLoc${parm}`] = gl.getUniformLocation(this.prog, `prm${parm}`);
						}

						for (const samp in progInfo.samplers) {
							this[`sampLoc${samp}`] = gl.getUniformLocation(this.prog, `smp${samp}`);
						}

					}

				}
			}

		}
	}

	use(gl) {
		if (!gl) {
			gl = drawWebGL2.gl;
		}
		if (gl) {
			gl.useProgram(this.prog);
		}
	}

	valid() { return this.prog != null; }

}

class Draw {
	constructor() {
		this.shaders = {};
		this.progs = {};
	}

	init(canvasId) {
		const canvas = document.getElementById(canvasId);
		if (!canvas) {
			console.error("Canvas not found.");
			return;
		}
		this.gl = null;
		try {
			this.gl = canvas.getContext("webgl2", {
				antialias: true,
				depth: true,
				alpha: true,

			});
		} catch(e) {
			console.error("Can't obtain webgl2 context.");
		}

		if (this.gl) {
			this.initGPUProgs();
		}
	}

	initGPUProgs() {
		var gpuSolidUnlit = new GPUProg(solid_unlit_prog);
		if (gpuSolidUnlit.valid()) {
			this.progs["solid_unlit_prog"] = gpuSolidUnlit;
		}
	}
}

const drawWebGL2 = new Draw();