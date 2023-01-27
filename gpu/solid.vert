#version 300 es

precision highp float;

in vec3 vtxPos;
in vec3 vtxNrm;
in vec3 vtxRGB;
in vec2 vtxTex;

uniform mat4 prmWorld;
uniform mat4 prmViewProj;

out vec3 pixPos;
out vec3 pixNrm;
out vec3 pixRGB;
out vec2 pixTex;

void main() {
	mat4 wm = prmWorld;
	pixPos = (vec4(vtxPos, 1.0) * wm).xyz;
	pixNrm = (vec4(vtxNrm, 0.0) * wm).xyz;
	pixRGB = vtxRGB;
	pixTex = vtxTex;
	gl_Position = vec4(pixPos, 1.0) * prmViewProj;
}
