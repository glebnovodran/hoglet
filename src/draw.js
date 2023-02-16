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

function validAttrib(location) {
	return (typeof location === "number") && (location >= 0);
}

function setVtxAttrib(loc, nelems, stride, offs) {
	const gl = drawWebGL2.gl;
	if (validAttrib(loc)) {
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, nelems, gl.FLOAT, false, stride, offs);
	}
	return offs + nelems*4;
}



class GPUProg {

	constructor(name, progInfo) {
		this.name = name;
		this.vert = null;
		this.frag = null;
		this.prog = null;
		this.nattr = 0;
		this.nparm = 0;
		this.nsamp = 0;
		this.vtxDesc = { names : [], sizes: []};

		const gl = drawWebGL2.gl;

		if (gl && progInfo) {
			this.vert = drawWebGL2.shaders[progInfo.vs.name];
			if (this.vert == null) {
				this.vert = compileVertShader(progInfo.vs.src);
				if (this.vert) {
					drawWebGL2.shaders[progInfo.vs.name] = this.vert;
				}
			}

			this.frag = drawWebGL2.shaders[progInfo.fs.name];
			if (this.frag == null) {
				this.frag = compileFragShader(progInfo.fs.src)
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
						this.nattr = progInfo.attrs.length;
						this.nparm = progInfo.gpblocks.length;
						this.nsamp = progInfo.samplers.length;
						this.vtxDesc.names = progInfo.attrs;
						this.vtxDesc.sizes = progInfo.attrSizes;

						for (const attr of progInfo.attrs) {
							this[`attrLoc${attr}`] = gl.getAttribLocation(this.prog, `vtx${attr}`);
						}

						for (const gpblock of progInfo.gpblocks) {
							this[`gpLoc${gpblock}`] = gl.getUniformBlockIndex(this.prog, `GP${gpblock}`);
						}

						for (const samp of progInfo.samplers) {
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
		var gpuSolidUnlit = new GPUProg("solid_unlit_prog", solid_unlit_prog);
		if (gpuSolidUnlit.valid()) {
			this.progs[gpuSolidUnlit.name] = gpuSolidUnlit;
		}
	}
}

const drawWebGL2 = new Draw();