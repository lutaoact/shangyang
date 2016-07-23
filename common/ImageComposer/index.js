'use strict';

const Canvas = require('canvas')

const fs = require('fs');


const WIDTH = 400;
const HEIGHT = 700;

const canvas = new Canvas(WIDTH, HEIGHT);
const Image = Canvas.Image;
const ctx = canvas.getContext('2d')

const Promise = require('bluebird')

const BACKGROUND = {
	SRC: __dirname + '/background.jpg',
	X: 0,
	Y: 0,
	WIDTH: WIDTH,
	HEIGHT: HEIGHT
};

const QRCODE = {
	SRC: __dirname + '/qrcode.jpg',
	X: BACKGROUND.WIDTH / 2 - 125,
	Y: 0,
	WIDTH: 125
}

const PORTRAIT = {
	SRC: __dirname + 'portrait.png',
	RADIUS: 50
}

const ImageComposer = function (qrcode, portrait, background ) {
	this.qrcode = qrcode || QRCODE;
	this.portrait = portrait || PORTRAIT;
	this.background = background || BACKGROUND;	
};

ImageComposer.prototype.drwaBackground = function () {
	return new Promise(function (resolve, reject) {
		fs.readFile(__dirname + '/background.jpg', function(err, image) {
			if (err) throw reject(err);
			let img = new Image;
			img.src = image;
			ctx.drawImage(img, 0, 0, 400, 720);
			resolve();
		});
	});
};

ImageComposer.prototype.drawQrcode = function () {
	return new Promise(function (resolve, reject) {
		fs.readFile(__dirname + '/qrcode.jpg', function(err, origin) {
			if (err) throw reject(err);
			let img = new Image;
			img.src = origin;
			ctx.drawImage(img, 85, 530, 125, 125);
			resolve();

		});
	});
}

ImageComposer.prototype.drawPotrait = function () {
	return new Promise(function (resolve, reject) {
		fs.readFile(__dirname + '/portrait.png', function(err, origin) {
			if (err) throw reject(err);

			let img = new Image;
			img.src = origin;

			if (err) throw err;

			ctx.beginPath();  
			ctx.translate(0,0);  

			ctx.arc(270, 592.5, 50, 0, Math.PI * 2, true);  

			ctx.clip()

			ctx.drawImage(img, 220, 542.5, 100, 100);

			resolve();
		});

	});
}

ImageComposer.prototype.ouput = function () {
	return new Promise(function (resolve, reject) {
		const outStream = fs.createWriteStream(__dirname + '/poster.png')
		let stream = canvas.createPNGStream();
		stream.on('data', function(chunk){
			outStream.write(chunk);
			resolve();
		});
	});
}
ImageComposer.prototype.compose = function (opt) {

	if (opt) {
		this.background.src = opt && opt.background || this.background.src;
		this.qrcode.src = opt && opt.qrcode || this.qrcode.src;
		this.portrait.src = opt && opt.portrait || this.portrait.src;
	}

	this.drwaBackground()
		.then(() => this.drawQrcode())
		.then(() => this.drawPotrait())
		.then(() => this.ouput())
		.catch((err) => {
			console.error('Error: ' + err);
		})

}


module.exports = ImageComposer;

