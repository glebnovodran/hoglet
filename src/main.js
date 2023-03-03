/* SPDX-License-Identifier: MIT */
/* SPDX-FileCopyrightText: 2023 Glib Novodran <novodran@gmail.com> */

function loop() {
	const gl = drawWebGL2.gl;
	gl.colorMask(true, true, true, true);
	gl.clearColor(0.5, 0.5, 0.55, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	gl.depthMask(true);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	scene.exec();
	scene.draw();
	requestAnimationFrame(loop);
}

function demo_start() {
	requestAnimationFrame(loop);
}

function main() {
	console.clear();
	drawWebGL2.init("webgl2_canvas");
	scene.init([{name :"box", str : json_box}]);
	demo_start();
}