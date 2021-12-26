const { vec2, vec3, mat3, mat4 } = glMatrix;
let mouse = {
	drag: false,
	lastX: 0,
	lastY: 0,
	anglex: 0,
	angley: 0,
}
let sumTime1 = 0;
let sumTime2 = 0;
let sumTime3 = 0;
let lastTime = 0;
let score = 0;
let bacteriaArr = [];
let vertices = [];
let colors = [];
let indices = [];
let explosionArr = [];
let explosionArrTemp = [];
let sphereR = 5;
let bacteriaWin = 0;

class Sphere {
	constructor(posX, posY, posZ, r) {
		this.r = r;
		this.posX = posX;	//initial positions
		this.posY = posY;
		this.posZ = posZ;
		this.yangle = 0; // -90 <= angle <= 90
		this.xangle = 0; // 0 <= angle <= 360
		this.x = [];	// all outer points (circumference)
		this.y = [];
		this.z = [];
		this.R = 0.1;
		this.G = 0.74;
		this.B = 1.0;
	}
	init = () => {
		let tempx = [];
		let tempy = [];
		let tempz = [];
		for (let i = -90; i <= 90; i += 10) {	// each step down count: 19
			for (let j = 0; j < 360; j += 10) {	//each step around count: 37
				tempx.push(this.posX + this.r * Math.cos(toRadians(i)) * Math.cos(toRadians(j)));
				tempy.push(this.posY + this.r * Math.cos(toRadians(i)) * Math.sin(toRadians(j)));
				tempz.push(this.posZ + this.r * Math.sin(toRadians(i)));
			}
		}
		this.x = tempx;
		this.y = tempy;
		this.z = tempz;
	}
}

class Bacteria extends Sphere {
	constructor(angle1, angle2, r) {
		let x = sphereR * Math.cos(angle1) * Math.cos(angle2);
		let y = sphereR * Math.cos(angle1) * Math.sin(angle2);
		let z = sphereR * Math.sin(angle1);
		super(x, y, z, r);
		this.tempR = Math.round(Math.random() * 255);
		this.tempG = Math.round(Math.random() * 255);
		this.tempB = Math.round(Math.random() * 255);
		this.R = this.tempR / 255;
		this.G = this.tempG / 255;
		this.B = this.tempB / 255;
		this.angle1 = angle1;
		this.angle2 = angle2;
		this.bool = false;
	}
}

class Explosion extends Sphere {
	constructor(angle1, angle2, r, num, R, G, B) {
		let x = 5 * Math.cos(angle1) * Math.cos(angle2);
		let y = 5 * Math.cos(angle1) * Math.sin(angle2);
		let z = 5 * Math.sin(angle1);
		super(x, y, z, r);
		this.R = R;
		this.G = G;
		this.B = B;
		this.num = num;
	}
	explosionInit = () => {
		let tempx = [];
		let tempy = [];
		let tempz = [];
		for (let i = -60; i <= 60; i += 60) {	// each step down count: 3
			for (let j = 0; j < 360; j += 60) {	//each step around count: 6
				tempx.push(this.posX + this.r * Math.cos(toRadians(i)) * Math.cos(toRadians(j)));
				tempy.push(this.posY + this.r * Math.cos(toRadians(i)) * Math.sin(toRadians(j)));
				tempz.push(this.posZ + this.r * Math.sin(toRadians(i)));

				tempx.push(this.posX + (this.r + this.num / 2) * Math.cos(toRadians(i)) * Math.cos(toRadians(j)));
				tempy.push(this.posY + (this.r + this.num / 2) * Math.cos(toRadians(i)) * Math.sin(toRadians(j)));
				tempz.push(this.posZ + (this.r + this.num / 2) * Math.sin(toRadians(i)));
			}
		}
		this.x = tempx;
		this.y = tempy;
		this.z = tempz;
	}
}

const randomAngle1 = () => {
	return toRadians(Math.floor(Math.random() * 180 - 90));
}

const randomAngle2 = () => {
	return toRadians(Math.floor(Math.random() * 360));
}

const toRadians = (angle) => {
	return angle * (Math.PI / 180);
}

const spawnBacteria = () => {
	let temp = 3 + Math.floor(Math.random() * 3); // 3-5 bacteria spawn
	let length = bacteriaArr.length;
	for (let i = length; i < length + temp; i++) {
		if (bacteriaArr.length >= 10) break;
		bacteriaArr[i] = new Bacteria(randomAngle1(), randomAngle2(), 0.6);	//bacteria spawn at random bacteria.x,y on the disk due to class bacteria
		bacteriaArr[i].init();
		vertices = vertices.concat(convertToVertices(bacteriaArr[i]));
		colors = colors.concat(convertToColors(bacteriaArr[i]));
		indices = indices.concat(convertToIndices(bacteriaArr[i]));
	}
}

const deleteBacteria = (R, G, B) => {
	for (let i = 0; i < bacteriaArr.length; i++) {
		let temp = bacteriaArr[i];
		if ((temp.tempR == R || temp.tempR == R + 1 || temp.tempR == R - 1 || temp.tempR == R + 2 || temp.tempR == R - 2) && (temp.tempG == G || temp.tempG == G + 1 || temp.tempG == G - 1 || temp.tempG == G + 2 || temp.tempG == G - 2) && (temp.tempB == B || temp.tempB == B + 1 || temp.tempB == B - 1 || temp.tempB == B + 2 || temp.tempB == B - 2)) {
			vertices.splice(3 * 6 * 3 * explosionArr.length + 18 * 36 * 2 * 3 * 3 * (i + 1), 18 * 36 * 2 * 3 * 3);
			colors.splice(3 * 6 * 3 * explosionArr.length + 18 * 36 * 2 * 3 * 3 * (i + 1), 18 * 36 * 2 * 3 * 3);
			indices.splice(3 * 6 * explosionArr.length + 18 * 36 * 2 * 3 * (i + 1), 18 * 36 * 2 * 3);
			bacteriaArr.splice(i, 1);
			updateIndices();
			break;
		}
	}
	playerWin();
}

const deleteBacteriaByIndex = (index) => {
	bacteriaArr.splice(index, 1);
	vertices.splice(3 * 6 * 3 * explosionArr.length + 18 * 36 * 2 * 3 * 3 * (index + 1), 18 * 36 * 2 * 3 * 3);
	colors.splice(3 * 6 * 3 * explosionArr.length + 18 * 36 * 2 * 3 * 3 * (index + 1), 18 * 36 * 2 * 3 * 3);
	indices.splice(3 * 6 * explosionArr.length + 18 * 36 * 2 * 3 * (index + 1), 18 * 36 * 2 * 3);
	updateIndices();
}

const updateIndices = () => {
	let temp = indices.length;
	indices = [];
	for (let i = 0; i < temp; i++) {
		indices.push(i);
	}
}

const checkStatus = () => {
	for (let i = 0; i < bacteriaArr.length; i++) {
		if (bacteriaArr[i].r > 1.5 && !bacteriaArr[i].bool) {
			bacteriaWin++;
			console.log('Bacteria has reached threshold!');
			bacteriaArr[i].bool = true;
		}
	}
	if (bacteriaWin >= 2) {
		alert('You lost! Bacteria took over!\n2 Bacteria reached threshold!');
		location.reload();
		setTimeout(() => {
			window.stop();
		}, 3000);
	}
	if (score > 3000) {
		alert("You lost! Bacteria took over!\nBacteria's score reached 3000!");
		location.reload();
		setTimeout(() => {
			window.stop();
		}, 3000);
	}
}

const playerWin = () => {
	if (bacteriaArr.length == 0) {
		alert('You have won the game!');
		location.reload();
	}
}

const growRadius = () => {
	vertices.splice(3 * 6 * explosionArr.length + 18 * 36 * 2 * 3 * 3, 18 * 36 * 2 * 3 * 3 * bacteriaArr.length);
	for (let i of bacteriaArr) {
		i.r += 0.01;
		i.init();
		vertices = vertices.concat(convertToVertices(i));
	}
}

const updateScore = () => {
	for (let i of bacteriaArr) {
		score += Math.round(10 * i.r);
	}
}

const collide = () => {
	try {
		for (let i = 0; i < bacteriaArr.length - 1; i++) {
			for (let j = 1; j < bacteriaArr.length; j++) {
				if (i == j) {
					continue;
				}
				let dist = Math.sqrt(Math.pow(bacteriaArr[i].posX - bacteriaArr[j].posX, 2) + Math.pow(bacteriaArr[i].posY - bacteriaArr[j].posY, 2) + Math.pow(bacteriaArr[i].posZ - bacteriaArr[j].posZ, 2))
				if (dist <= bacteriaArr[i].r + bacteriaArr[j].r) {
					console.log('collided!');
					merge(bacteriaArr[i], bacteriaArr[j]);
				}
			}
		}
	} catch (error) {
		console.log('collide error');
	}
}

const merge = (bacteria1, bacteria2) => {
	let angle1 = (bacteria1.angle1 + bacteria2.angle1) / 2;
	let angle2 = (bacteria1.angle2 + bacteria2.angle2) / 2;
	let midR = Math.sqrt(Math.pow(bacteria1.r, 2) + Math.pow(bacteria2.r, 2));
	bacteriaArr[bacteriaArr.length] = new Bacteria(angle1, angle2, midR);
	if (bacteria1.r >= bacteria2.r) {
		bacteriaArr[bacteriaArr.length - 1].R = bacteria1.R;
		bacteriaArr[bacteriaArr.length - 1].G = bacteria1.G;
		bacteriaArr[bacteriaArr.length - 1].B = bacteria1.B;
	} else {
		bacteriaArr[bacteriaArr.length - 1].R = bacteria2.R;
		bacteriaArr[bacteriaArr.length - 1].G = bacteria2.G;
		bacteriaArr[bacteriaArr.length - 1].B = bacteria2.B;
	}
	bacteriaArr[bacteriaArr.length - 1].init();
	deleteBacteriaByIndex(bacteriaArr.indexOf(bacteria1));
	deleteBacteriaByIndex(bacteriaArr.indexOf(bacteria2));
	vertices = vertices.concat(convertToVertices(bacteriaArr[bacteriaArr.length - 1]));
	colors = colors.concat(convertToColors(bacteriaArr[bacteriaArr.length - 1]));
	indices = indices.concat(convertToIndices(bacteriaArr[bacteriaArr.length - 1]));
}

const convertToVertices = (sphere) => {
	// k1---k3	k1 = x[0]	k3 = x[1]
	// |  / |
	// | /  |
	// k2---k4	k2 = x[36]	k4 = x[37]
	let vertices = [];
	for (let i = 0; i < 18; i++) {	//step down count -1
		for (let j = 0; j < 36; j++) {	//step around -1

			//first triangle (left)

			vertices.push(sphere.x[i * 36 + j]);	//push k1.x
			vertices.push(sphere.y[i * 36 + j]);	//push k1.y
			vertices.push(sphere.z[i * 36 + j]);	//push k1.z

			vertices.push(sphere.x[(i + 1) * 36 + j]);	//push k2.x
			vertices.push(sphere.y[(i + 1) * 36 + j]);	//push k2.y
			vertices.push(sphere.z[(i + 1) * 36 + j]);	//push k2.z

			vertices.push(sphere.x[i * 36 + j + 1]);	//push k3.x
			vertices.push(sphere.y[i * 36 + j + 1]);	//push k3.y
			vertices.push(sphere.z[i * 36 + j + 1]);	//push k3.z

			//second triangle (left)

			vertices.push(sphere.x[i * 36 + j + 1]);	//push k3.x
			vertices.push(sphere.y[i * 36 + j + 1]);	//push k3.y
			vertices.push(sphere.z[i * 36 + j + 1]);	//push k3.z

			vertices.push(sphere.x[(i + 1) * 36 + j]);	//push k2.x
			vertices.push(sphere.y[(i + 1) * 36 + j]);	//push k2.y
			vertices.push(sphere.z[(i + 1) * 36 + j]);	//push k2.z

			vertices.push(sphere.x[(i + 1) * 36 + j + 1]);	//push k4.x
			vertices.push(sphere.y[(i + 1) * 36 + j + 1]);	//push k4.y
			vertices.push(sphere.z[(i + 1) * 36 + j + 1]);	//push k4.z
		}
	}
	return vertices;
}

const convertToIndices = (sphere) => {
	let arr = [];
	for (let i = indices.length; i < indices.length + (6 * 36 * 18); i++) {
		arr.push(i);
	}
	return arr;
}

const convertToColors = (sphere) => {
	let arr = [];
	for (let i = 0; i < (18 * 36 * 2 * 3); i++) {
		arr.push(sphere.R);
		arr.push(sphere.G);
		arr.push(sphere.B);
	}
	return arr;
}

const convertToColorsMain = (sphere) => {
	let arr = [];
	for (let i = 0; i < (18 * 36 * 2 * 3); i++) {
		arr.push(sphere.R + Math.random() * 0.1);
		arr.push(sphere.G + Math.random() * 0.1);
		arr.push(sphere.B + Math.random() * 0.1);
	}
	return arr;
}

const convertExplosionIndices = (explosion) => {
	let indices = [];
	for (let i = 0; i < (3 * 6); i++) {
		indices.push(i);
	}
	return indices;
}

const deleteExplosion = (index) => {
	explosionArr.splice(index, 1);
	vertices.splice(3 * 7 * 3 * index, 3 * 7 * 3);
	colors.splice(3 * 7 * 3 * index, 3 * 7 * 3);
	indices.splice(3 * 7 * index, 3 * 7);
	updateIndices();
}

const convertExplosionVertices = (explosion) => {
	let vertices = [];
	for (let i = 0; i <= 3; i++) {	//step down count -1
		for (let j = 0; j <= 6; j++) {	//step around -1
			vertices.push(explosion.x[j * 2 + i * 14]);	
			vertices.push(explosion.y[j * 2 + i * 14]);	
			vertices.push(explosion.z[j * 2 + i * 14]);	

			vertices.push(explosion.x[j * 2 + i * 14 + 1]);	
			vertices.push(explosion.y[j * 2 + i * 14 + 1]);	
			vertices.push(explosion.z[j * 2 + i * 14 + 1]);	

			vertices.push(explosion.x[j * 2 + i * 14 + 1]);	
			vertices.push(explosion.y[j * 2 + i * 14 + 1]);	
			vertices.push(explosion.z[j * 2 + i * 14 + 1]);	
		}
	}
	return vertices;
}

const convertExplosionColors = (explosion) => {
	let arr = [];
	for (let i = 0; i < (3 * 6 * 3); i++) {
		arr.push(explosion.R);
		arr.push(explosion.G);
		arr.push(explosion.B);
	}
	return arr;
}

const explode = (explosion, num) => {
	if (num == 1) {
		const temp = explosion;
		temp.explosionInit();
		vertices = convertExplosionVertices(temp).concat(vertices);
		colors = convertExplosionColors(temp).concat(colors);
		indices = convertExplosionIndices(temp).concat(indices);
		explosionArrTemp.push(temp);
	} else if (num == 2 || num == 3) {
		const temp = new Explosion(explosion.angle1, explosion.angle2, explosion.r + 1, explosion.num, explosion.R, explosion.G, explosion.B);
		temp.explosionInit();
		vertices = convertExplosionVertices(temp).concat(vertices);
		colors = convertExplosionColors(temp).concat(colors);
		indices = convertExplosionIndices(temp).concat(indices);
		explosionArrTemp.push(temp);
	}
}

let sphere = new Sphere(0, 0, 0, 5);
sphere.init();
vertices = convertToVertices(sphere);
colors = convertToColorsMain(sphere);
indices = convertToIndices(sphere);

var vertexShaderText = [
	'precision mediump float;',

	'attribute vec3 position;',
	'attribute vec3 color;',
	'uniform mat4 world;',
	'uniform mat4 view;',
	'uniform mat4 proj;',
	'varying vec3 fragColor;',

	'void main()',
	'{',
	'   mat4 mvp = proj*view*world;',
	'	fragColor = color;',
	'	gl_Position = mvp*vec4(position,1.0);',
	'	gl_PointSize = 10.0;',
	'}'
].join('\n');

var fragmentShaderText =
	[
		'precision mediump float;',

		'varying vec3 fragColor;',

		'void main()',
		'{',

		'	gl_FragColor = vec4(fragColor,1.0);',
		'}',
	].join('\n')


var InitDemo = function () {


	//////////////////////////////////
	//       initialize WebGL       //                                                                                                           
	//////////////////////////////////
	console.log('this is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('webgl not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}
	if (!gl) {
		alert('your browser does not support webgl');
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.clearColor(0.5, 0.8, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//////////////////////////////////
	// create/compile/link shaders  //
	//////////////////////////////////
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Error linking program!', gl.getProgramInfo(program));
		return;
	}

	// Create and store data into vertex buffer
	var vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Create and store data into color buffer
	var color_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// Create and store data into index buffer
	var index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	//////////////////////////////////
	//    create triangle buffer    //
	//////////////////////////////////

	//all arrays in JS is Float64 by default

	var positionAttribLocation = gl.getAttribLocation(program, 'position');
	var colorAttribLocation = gl.getAttribLocation(program, 'color');
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.vertexAttribPointer(
		positionAttribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		0,
		0
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.vertexAttribPointer(
		colorAttribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		0,
		0
	);
	gl.enableVertexAttribArray(colorAttribLocation);

	gl.useProgram(program);

	gl.enable(gl.DEPTH_TEST);

	//////////////////////////////////
	//            matrics           //
	//////////////////////////////////

	var world = new Float32Array(16);
	mat4.identity(world);

	var view = new Float32Array(16);
	mat4.lookAt(view, [0, 0, 15], [0, 0, 0], [0, 1, 0])

	var proj = new Float32Array(16);
	mat4.perspective(proj, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 100);

	//////////////////////////////////
	//    send to vertex shader     //
	//////////////////////////////////

	//get the address of each matrix in the vertex shader
	var matWorldUniformLocation = gl.getUniformLocation(program, 'world');
	var matViewUniformLocation = gl.getUniformLocation(program, 'view');
	var matProjUniformLocation = gl.getUniformLocation(program, 'proj');

	//send each matrix to the correct location in vertex shader
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, world);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, view);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, proj);

	// var angle = 0;
	var roty = new Float32Array(16);
	var rotx = new Float32Array(16);

	mat4.identity(rotx);
	mat4.identity(rotx);
	//////////////////////////////////
	//            Draw              //
	//////////////////////////////////

	//file:///D:/courses/COSC414%20(Graphics)/Lab/index.html

	canvas.onmousemove = function (ev) {
		let x = ev.clientX;
		let y = ev.clientY;
		if (mouse.drag) {
			let speed = 3 / canvas.height;
			let dx = speed * (x - mouse.lastX);	//distance mousex
			let dy = speed * (y - mouse.lastY);	//distance mousey

			mouse.anglex = mouse.anglex + dy;
			mouse.angley = mouse.angley + dx;
		}
		mouse.lastX = x;
		mouse.lastY = y;
	}

	canvas.onmouseup = function (ev) {
		mouse.drag = false;
	}

	canvas.onmousedown = function (ev) {

		//rotating (taking last x, y)

		mouse.lastX = ev.clientX;
		mouse.lastY = ev.clientY;
		mouse.drag = true;

		//checking color

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, world);
		gl.clearColor(0.5, 0.8, 0.8, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		var pixelValues = new Uint8Array(4);
		gl.readPixels(ev.clientX, canvas.height - ev.clientY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);

		deleteBacteria(pixelValues[0], pixelValues[1], pixelValues[2]);
	}

	spawnBacteria();

	var loop = function (time = 0) {

		sumTime1 += time - lastTime;
		sumTime2 += time - lastTime;
		sumTime3 += time - lastTime;
		lastTime = time;

		if (sumTime1 > 300) {
			growRadius();
			collide();
			updateScore();
			console.log(score);
			sumTime1 = 0;
			checkStatus();
		}

		if (sumTime2 > 10000) {
			spawnBacteria();
			sumTime2 = 0;
		}

		if (sumTime3 > 100) {	//explode doesnt work yet (deletes necessary vertices and doesn't show neseccary bacteria explosion)
			// explode();
			sumTime3 = 0;
		}

		mat4.fromRotation(rotx, mouse.anglex, [1, 0, 0]);
		mat4.fromRotation(roty, mouse.angley, [0, 1, 0]);
		mat4.multiply(world, roty, rotx);

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, world);
		gl.clearColor(0.5, 0.8, 0.8, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
};