// AUTOGENERATED FROM GPU PROGRAMS DESCRIPTION

// ../gpu/solid.vert
var shader_solid_vert =
	"#version 300 es\n" +
	"\n" +
	"precision highp float;\n" +
	"\n" +
	"in vec3 vtxPos;\n" +
	"in vec3 vtxNrm;\n" +
	"in vec3 vtxRGB;\n" +
	"in vec2 vtxTex;\n" +
	"\n" +
	"out vec3 pixPos;\n" +
	"out vec3 pixNrm;\n" +
	"out vec3 pixRGB;\n" +
	"out vec2 pixTex;\n" +
	"\n" +
	"layout(std140) uniform GPXform {\n" +
	"\tmat4 gpWorld;\n" +
	"};\n" +
	"\n" +
	"layout(std140) uniform GPScene {\n" +
	"\tmat4 gpViewProj;\n" +
	"};\n" +
	"\n" +
	"void main() {\n" +
	"\tmat4 wm = gpWorld;\n" +
	"\tpixPos = (vec4(vtxPos, 1.0) * wm).xyz;\n" +
	"\tpixNrm = (vec4(vtxNrm, 0.0) * wm).xyz;\n" +
	"\tpixRGB = vtxRGB;\n" +
	"\tpixTex = vtxTex;\n" +
	"\tgl_Position = vec4(pixPos, 1.0) * gpViewProj;\n" +
	"}\n" +
"";

// ../gpu/unlit.frag
var shader_unlit_frag =
	"#version 300 es\n" +
	"\n" +
	"precision highp float;\n" +
	"\n" +
	"in vec3 pixPos;\n" +
	"in vec3 pixNrm;\n" +
	"in vec3 pixRGB;\n" +
	"in vec2 pixTex;\n" +
	"\n" +
	"out vec4 outClr;\n" +
	"\n" +
	"layout(std140) uniform GPModel { \n" +
	"\tvec3 prmBaseColor;\n" +
	"};\n" +
	"\n" +
	"void main() {\n" +
	"\tvec3 clr = pixRGB * prmBaseColor;\n" +
	"\toutClr = vec4(clr, 1.0f);\n" +
	"}\n" +
	"\n" +
"";

// ../gpu/solid_unlit.prog
var solid_unlit_prog = {
	 vs:{ name: "shader_solid_vert", src:shader_solid_vert },
	 fs:{ name: "shader_unlit_frag", src:shader_unlit_frag },
	 attrs:
		["Pos","Nrm","RGB","Tex"],
	 attrSizes:
		["3","3","3","2"],
	 gpblocks:
		["Xform","Scene","Model"],
	 samplers:
		[],
}
