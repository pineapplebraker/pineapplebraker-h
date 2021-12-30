"use strict";

var bullets = [];
var mePos = { x: 0.0, y: -0.9 };
var bulletsMode = 0;

//// Render view
const vsSource =
	`#version 300 es

	precision highp float;

	in vec4 vertexPosition;
	in vec3 vertexTextureCoord;
	uniform mat4 modelMatrix;
	uniform mat3 textureMatrix;

	out vec3 vTextureCoord;

	void main(void) {
		gl_Position = modelMatrix * vertexPosition;
		vTextureCoord = textureMatrix * vertexTextureCoord;
	}
`;
// Fragment shader program
const fsSource =
	`#version 300 es
	#define M_PI 3.1415926535897932384626433832795

	precision highp float;

	uniform sampler2D tx;
	uniform vec3 colorCoeff;

	in vec3 vTextureCoord;

	out vec4 fragmentColor;

	void main(void) {
		fragmentColor = vec4(colorCoeff, 1.0) * texture(tx, vTextureCoord.xy);
	}
`;



window.onload = init;

function init() {
	// Initialize HTML

	// Start WebGL
	glmain();
}

function glmain() {
	const canvas = document.querySelector('#glcanvas');

	// Get WebGL instance
	const gl = canvas.getContext('webgl2', { antialias: true });
	// If we don't have a GL context, give up now
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const renderShaderProgram = initShaderProgram(gl, vsSource, fsSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVevrtexColor and also
	// look up uniform locations.
	const renderProgramInfo = {
		shaderProgram: renderShaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(renderShaderProgram, 'vertexPosition'),
			vertexTextureCoord: gl.getAttribLocation(renderShaderProgram, 'vertexTextureCoord'),
		},
		uniformLocations: {
			tx: gl.getUniformLocation(renderShaderProgram, 'tx'),
			modelMatrix: gl.getUniformLocation(renderShaderProgram, 'modelMatrix'),
			textureMatrix: gl.getUniformLocation(renderShaderProgram, 'textureMatrix'),
			colorCoeff: gl.getUniformLocation(renderShaderProgram, 'colorCoeff'),
		},
	};

	const screen = createScreen();
	const screenBuffers = createVBO(gl, screen);
	const textures = createTexture(gl);

	// Draw the scene repeatedly
	let count = 0;
	function render(now) {
		++count;
		if (count > 300) {
			count = 0;
			bulletsMode = (bulletsMode + 1) % 3;
		}
		
		if (bullets.length < 1000) {
			switch (bulletsMode) {
			case 0:
				if (Math.random() > 0.7) {
					bullets.push({
						x: 2.0 * Math.random() - 1.0,
						y: 1.0,
						t: 0,
						col: [ 0.8, 1.0, 0.8 ],
						f_v: (n) => {
							return {
								x: 0.0,
								y: -0.01
							};
						},
					});
				}
				break;
			case 1:
				if (count > 30 && count % 20 == 0) {
					const bulletsNum = 24;
					for (let i = 0; i < bulletsNum; i++) {
						let th = (i + count / 15 * 0.25) / bulletsNum * Math.PI * 2.0;
						bullets.push({
							x: 0.0,
							y: 0.2,
							t: 0,
							col: [ 0.5, 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random() ],
							f_v: (n) => {
								return {
									x: 0.01 * Math.cos(th),
									y: 0.01 * Math.sin(th),
								};
							},
						});
					}
				}
				break;
			case 2:
				if (count > 30 && count % 20 == 0) {
					const bulletsNum = 24;
					for (let i = 0; i < bulletsNum; i++) {
						let th = (i / bulletsNum) * Math.PI * 2.0;
						bullets.push({
							x: 0.0,
							y: 0.0,
							t: 0,
							col: [ 0.8 + 0.2 * Math.random(), 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random() ],
							f_v: (n) => {
								return {
									x: 0.2 * (Math.exp(n * 0.001) - 1.0) * Math.cos(th + n * 0.005 * Math.PI),
									y: 0.2 * (Math.exp(n * 0.001) - 1.0) * Math.sin(th + n * 0.005 * Math.PI),
								};
							},
						});
					}
				}
				break;
			case 3:
				if (Math.random() > 0.7) {
					let th = Math.random() * Math.PI * 2.0;
					bullets.push({
						x: 0.0,
						y: 0.0,
						t: 0,
						texture: 3,
						f_v: (n) => {
							return {
								x: 0.01 * Math.cos(th + n / 300 * Math.PI),
								y: 0.01 * Math.sin(th + n / 300 * Math.PI),
							};
						},
					});
				}
			}
		}
		for (let i = 0; i < bullets.length; i++) {
			// Move bullets as its velocity
			bullets[i].t += 1;
			const v = bullets[i].f_v(bullets[i].t);
			bullets[i].x += v.x;
			bullets[i].y += v.y;

			// Remove bullets get out from view
			if (bullets[i].x < -1.0 || 1.0 < bullets[i].x ||
			    bullets[i].y < -1.0 || 1.0 < bullets[i].y) {
				bullets.splice(i, 1);
				i--;
			}
		}
		drawScene(gl, renderProgramInfo, textures, screenBuffers);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}


function createScreen() {
	const positions = [
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
	];

	const indices = [
		0, 1, 2, 0, 2, 3,
	];

	const texcoords = [
		-1.0, -1.0, 1.0,
		 1.0, -1.0, 1.0,
		 1.0,  1.0, 1.0,
		-1.0,  1.0, 1.0,
	];

	return {
		positions: positions,
		texcoords: texcoords,
		indices: indices,
	};
}

function createVBO(gl, data) {
	// Bind buffers
	let positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.positions),
		gl.STATIC_DRAW);

	let texcoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.texcoords),
		gl.STATIC_DRAW);

	let indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(data.indices),
		gl.STATIC_DRAW);

	return {
		positions: {
			data: positionBuffer,
			numComponents: 3,
			type: gl.FLOAT,
			normalize: false,
		},
		texcoords: {
			data: texcoordBuffer,
			numComponents: 3,
			type: gl.FLOAT,
			normalize: false,
		},
		indices: indexBuffer,
		vertexCount: data.indices.length,
	};
}

function createTexture(gl) {
	const img = document.getElementById("textureImage01");

	const tx = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tx);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	return [tx];
}

function initShaderProgram(gl, vsSource, fsSource) {
	let vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	let shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
}

function loadShader(gl, type, source) {
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Failed to compile the shader program: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function drawScene(gl, renderProgramInfo, textures, screenBuffers)
{
	////////////////////////////////////////////////////////////////
	// Render
	////////////////////////////////////////////////////////////////
	gl.useProgram(renderProgramInfo.shaderProgram);

	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear with black
	gl.clearDepth(1.0); // Clear everything
	gl.enable(gl.BLEND); // Enable alpha blending
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DETPH_BUFFER_BIT);

	const textureMatrix = createIdenticalMat3();
	textureMatrix[0] = 0.5; textureMatrix[4] = -0.5; // Scale
	textureMatrix[6] = 0.5; textureMatrix[7] = 0.5; // Shift

	gl.uniform1i(
	    renderProgramInfo.uniformLocations.texture,
	    0);
	gl.uniformMatrix3fv(
	    renderProgramInfo.uniformLocations.textureMatrix,
	    false,
	    textureMatrix);

	// Draw bullets
	for (let i = 0; i < bullets.length; i++) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[0]);

		let modelMatrix = createIdenticalMat4();
		modelMatrix[0] = 0.1; // scaleX
		modelMatrix[5] = 0.1; // scaleY
		modelMatrix[12] = bullets[i].x; // dX
		modelMatrix[13] = bullets[i].y; // dY

		gl.uniformMatrix4fv(
		    renderProgramInfo.uniformLocations.modelMatrix,
		    false,
		    modelMatrix);
		gl.uniform3fv(
		    renderProgramInfo.uniformLocations.colorCoeff,
		    bullets[i].col);

		enableAttribute(gl, renderProgramInfo.attribLocations, screenBuffers);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenBuffers.indices);
		gl.drawElements(gl.TRIANGLES, screenBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
	}
	// Draw me
	{
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[0]);

		let modelMatrix = createIdenticalMat4();
		modelMatrix[0] = 0.01; // scaleX
		modelMatrix[5] = 0.01; // scaleY
		modelMatrix[12] = mePos.x; // dX
		modelMatrix[13] = mePos.y; // dY

		gl.uniformMatrix4fv(
		    renderProgramInfo.uniformLocations.modelMatrix,
		    false,
		    modelMatrix);
		gl.uniform3fv(
		    renderProgramInfo.uniformLocations.colorCoeff,
		    [ 1.0, 0.0, 0.0 ]);

		enableAttribute(gl, renderProgramInfo.attribLocations, screenBuffers);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenBuffers.indices);
		gl.drawElements(gl.TRIANGLES, screenBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
	}
}

function enableAttribute(gl, locations, buffers) {
	let stride = 0;
	let offset = 0;
	// Positions
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions.data);
		gl.vertexAttribPointer(
			locations.vertexPosition,
			buffers.positions.numComponents,
			buffers.positions.type,
			buffers.positions.normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(locations.vertexPosition);
	}
	// Texture Coords
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords.data);
		gl.vertexAttribPointer(
			locations.vertexTextureCoord,
			buffers.texcoords.numComponents,
			buffers.texcoords.type,
			buffers.texcoords.normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(locations.vertexTextureCoord);
	}
}

function createIdenticalMat3() {
	let A = new Array(9);
	A[0] = 1.0; A[3] = 0.0; A[6] = 0.0;
	A[1] = 0.0; A[4] = 1.0; A[7] = 0.0;
	A[2] = 0.0; A[5] = 0.0; A[8] = 1.0;
	return A;
}

function createIdenticalMat4() {
	let A = new Array(16);
	A[0] = 1.0; A[4] = 0.0; A[8]  = 0.0; A[12] = 0.0;
	A[1] = 0.0; A[5] = 1.0; A[9]  = 0.0; A[13] = 0.0;
	A[2] = 0.0; A[6] = 0.0; A[10] = 1.0; A[14] = 0.0;
	A[3] = 0.0; A[7] = 0.0; A[11] = 0.0; A[15] = 1.0;
	return A;
}

