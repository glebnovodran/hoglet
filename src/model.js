const vtxAttribsOrder = ["N", "Cd", "uv"];
class Material {
	constructor() {
		this.path = "";
		this.id = -1;
		this.org = 0;
		this.ntri = 0;
	}
}

class Model {

	constructor(jsonObj) {
		const gl = drawWebGL2.gl;
		if (!gl) return;

		if (!jsonObj || jsonObj.dataType != "geo") return;
		if (!jsonObj.pnts || !jsonObj.pntsVecData) return; // ?

		this.npnt = jsonObj.npnt;
		this.ntri = jsonObj.ntri;
		this.nmtl = jsonObj.nmtl;
		this.hasSkin = false;

		const vbufData = this.getVBData(jsonObj);

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

		this.mtls = new Array(this.nmtl);
		for (let i = 0; i < this.nmtl; ++i) {
			this.mtls[i] = new Material();
			this.mtls[i].id = i;
			this.mtls[i].path = jsonObj.mtlPaths[i];
			this.mtls[i].org = mtlIBOffs[i];
			this.mtls[i].ntri = mtlTriCnt[i];
		}

		this.vbuf = gl.createBuffer();
		if (!this.vbuf) return;

		this.ibuf = gl.createBuffer();
		if (!this.ibuf) return;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
		gl.bufferData(gl.ARRAY_BUFFER, vbufData, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ibufData, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	}

	getVBData(jsonObj) {
		let attrOffsMap = {
			"N" : {"offs" : -1, "sz" : 3},
			"Cd" : {"offs" : -1, "sz" : 3},
			"uv" : {"offs" : -1, "sz" : 2}
		};

		const vecAttrSz = attrOffsMap.N.sz + attrOffsMap.Cd.sz + attrOffsMap.uv.sz;
		const vtxDataSz = 3 + vecAttrSz; // pos, N, Cd, uv
		this.vtxDataSz = vtxDataSz;

		for (const attrName in attrOffsMap) {
			const idx = jsonObj.pntVecAttrNames.findIndex((element) => element === attrName);
			if (idx < 0) {
				console.error("Can't find attribute :", attrName);
				return;
			}
			attrOffsMap[attrName].offs = this.npnt * idx * 3;
		}

		const vbufData = new Float32Array(this.npnt * vtxDataSz);
		const pntsPos = jsonObj.pnts;
		const pntsVecData = jsonObj.pntsVecData;
		for (let i = 0; i < this.npnt; ++i) {
			let vtxBase = i * vtxDataSz;
			vbufData[vtxBase + 0] = pntsPos[i * 3 + 0];
			vbufData[vtxBase + 1] = pntsPos[i * 3 + 1];
			vbufData[vtxBase + 2] = pntsPos[i * 3 + 2];
			let offs = 3;
			for (let k = 0; k < vtxAttribsOrder.length; ++k) {
				let attrName = vtxAttribsOrder[k];
				let attrVtxsz = attrOffsMap[attrName].sz;
				let attrDataOffs = attrOffsMap[attrName].offs;
				for (let j = 0; j < attrVtxsz; ++j) {
					vbufData[vtxBase + j + offs] = pntsVecData[attrDataOffs + i*3 + j];
				}
				offs += attrVtxsz;
			}
		}
		return vbufData;
	}

	bindBuffers(prog) {
		const gl = drawWebGL2.gl;
		if (!gl) return;
		const stride = this.vtxDataSz * 4;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
		setVtxAttrib(prog.attrLocPos, 3, stride, 0);
		setVtxAttrib(prog.attrLocNrm, 3, stride, 0);
		setVtxAttrib(prog.attrLocRGB, 3, stride, 0);
		setVtxAttrib(prog.attrLocTex, 2, stride, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf);
	}

	draw(prog) {

	}
}