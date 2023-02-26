#version 300 es

precision highp float;

in vec3 pixPos;
in vec3 pixNrm;
in vec3 pixRGB;
in vec2 pixTex;

out vec4 outClr;

layout(std140) uniform GPModel { 
	vec3 gpBaseColor;
};

layout(std140) uniform GPMaterial { 
	vec3 gpMtlDiffColor;
};

void main() {
	vec3 clr = pixRGB * prmBaseColor;
	outClr = vec4(clr, 1.0f);
}

