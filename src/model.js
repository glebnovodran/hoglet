/* SPDX-License-Identifier: MIT */
/* SPDX-FileCopyrightText: 2023 Glib Novodran <novodran@gmail.com> */

class MaterialParam {
	constructor() {
		this.diffClr = new Vec3(1.0, 1.0, 1.0);
	}
}
class MaterialBatch {
	constructor() {
		this.path = "";
		this.mtlId = -1;
		this.org = 0;
		this.ntri = 0;
		this.ubo = -1;
	}
}

class Model {

	constructor(jsonObj) {
		const gl = drawWebGL2.gl;
		if (!gl) return;

		if (!jsonObj || jsonObj.dataType != "geo") return;
		if (!jsonObj.pnts || !jsonObj.pntsVecData) return;

		this.npnt = jsonObj.npnt;
		this.ntri = jsonObj.ntri;
		this.nmtl = jsonObj.nmtl;
		this.hasSkin = false;

		const gpuProg = this.selectProg(this.hasSkin);
		const vbufData = Model.getVBData(jsonObj, gpuProg.vtxDesc);

		const mtlTriCnt = new Uint16Array(this.nmtl);
		mtlTriCnt.fill(0);
		for (let i = 0 ; i < this.ntri; ++i) {
			let mtlId = jsonObj.mtlIds[i];	
			mtlTriCnt[mtlId]++;
		}

		const mtlIBOffs = new Uint16Array(this.nmtl);
		mtlIBOffs[0] = 0;
		for (let i = 1 ; i < mtlIBOffs.length; ++i) {
			mtlIBOffs[i] = mtlIBOffs[i - 1] + 3 * mtlTriCnt[i - 1];
		}

		const ibufSize = this.ntri * 3;

		const ibufData = new Uint16Array(jsonObj.triIdx.length);
		const idxOffs = Uint32Array.from(mtlIBOffs);

		for (let i = 0; i < this.ntri; ++i) {
			let mtlId = jsonObj.mtlIds[i];
			let pos = idxOffs[mtlId];
			ibufData[pos++] = jsonObj.triIdx[i*3];
			ibufData[pos++] = jsonObj.triIdx[i*3 + 1];
			ibufData[pos++] = jsonObj.triIdx[i*3 + 2];
			idxOffs[mtlId] = pos;
		}

		this.batches = new Array(this.nmtl);
		for (let i = 0; i < this.nmtl; ++i) {
			this.batches[i] = new MaterialBatch();
			this.batches[i].mtlId = i;
			this.batches[i].path = jsonObj.mtlPaths[i];
			this.batches[i].org = mtlIBOffs[i];
			this.batches[i].ntri = mtlTriCnt[i];
		}

		this.vbuf = gl.createBuffer();
		if (!this.vbuf) return;

		this.ibuf = gl.createBuffer();
		if (!this.ibuf) return;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
		gl.bufferData(gl.ARRAY_BUFFER, vbufData, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ibufData, gl.STATIC_DRAW);

		this.vao = null;
		this.prepareVAO(gpuProg);
	}

	prepareVAO(gpuProg) {
		const gl = drawWebGL2.gl;
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);

		const stride = gpuProg.vtxDesc.dataSize * 4;

		let offset = 0;
		const nattr = gpuProg.vtxDesc.names.length;
		for (let i = 0; i < nattr; ++i) {
			const attrLoc = gpuProg[`attrLoc${attr}`];
			const attrSz = gpuProg.vtxDesc.sizes[i];
			offset = setVtxAttrib(attrLoc, attrSz, stride, offset);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf);
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		if (!gl.isVertexArray(this.vao)) {
			console.error("Invalid VAO");
		}
	}

	static getVBData(jsonObj, vtxDesc) {
		if (!vtxDesc || !jsonObj) return null;

		const attrOffsMap = {
			"Nrm"  : {"name" : "N", "offs" : -1},
			"RGB" : {"name" : "Cd", "offs" : -1},
			"Tex" : {"name" : "uv", "offs" : -1}
		};

		for (const attrName in attrOffsMap) {
			const jsonAttrName = attrOffsMap[attrName].name;
			const idx = jsonObj.pntVecAttrNames.findIndex((element) => element === jsonAttrName);
			if (idx < 0) {
				console.error("Can't find attribute :", attrName);
				return;
			}
			attrOffsMap[attrName].offs = jsonObj.npnt * idx * 3;
		}

		const vtxDataSz = vtxDesc.dataSize;

		const vbufData = new Float32Array(jsonObj.npnt * vtxDataSz);
		const pntsPos = jsonObj.pnts;
		const pntsVecData = jsonObj.pntsVecData;

		for (let i = 0; i < jsonObj.npnt; ++i) {
			const vtxBase = i * vtxDataSz;
			vbufData[vtxBase + 0] = pntsPos[i * 3 + 0];
			vbufData[vtxBase + 1] = pntsPos[i * 3 + 1];
			vbufData[vtxBase + 2] = pntsPos[i * 3 + 2];
			let offs = 3;
			for (let k = 0; k < vtxDesc.names.length; ++k) {
				const attrName = vtxDesc.names[k];

				const jsonAttrInfo = attrOffsMap[attrName];
				if (!jsonAttrInfo) continue;

				const attrVtxSz = vtxDesc.sizes[k];
				const attrDataOffs = jsonAttrInfo.offs;
				for (let j = 0; j < attrVtxSz; ++j) {
					vbufData[vtxBase + j + offs] = pntsVecData[attrDataOffs + i*3 + j];
				}
				offs += attrVtxSz;
			}
		}
		return vbufData;
	}

	selectProg(hasSkin, mtlBatch) {
		return drawWebGL2.getProg("solid_unlit_prog");
	}

	draw_batch(ibatch, ctx) {
		const gl = drawWebGL2.gl;

		if (ibatch >= this.batches.length) return;

		const batch = this.batches[ibatch];
		const prog = this.selectProg(this.hasSkin, batch);
		if (!prog) return;
		if (!prog.valid()) return;

		const cam = scene.cam;
		prog.use();
		gl.bindVertexArray(this.vao);

	}

	draw(ctx) {
		if (!ctx) return;
	}
}