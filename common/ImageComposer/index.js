/**
 * Module dependencies.
 */

'use strict';

const Canvas = require('canvas')
const canvas = new Canvas(400, 720)
const ctx = canvas.getContext('2d')
const fs = require('fs');
const Image = Canvas.Image;

const outStream = fs.createWriteStream(__dirname + '/poster.png')

let stream;



ctx.fillRect(0,0,400,720);   // Draw a rectangle with default settings
ctx.save();                  // Save the default state

// ctx.fillStyle = '#09F'       // Make changes to the settings
// ctx.fillRect(15,15,120,120); // Draw a rectangle with new settings


let img = new Image;
img.dataMode = Image.MODE_IMAGE; // Only image data tracked
img.dataMode = Image.MODE_MIME; // Only mime data tracked
img.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked

fs.readFile(__dirname + '/old.jpg', function(err, origin) {
  	if (err) throw err;
  	img = new Image;
  	img.src = origin;
  	ctx.drawImage(img, 0, 0, 400, 720);

	fs.readFile(__dirname + '/qrcode.jpg', function(err, origin) {
	  	if (err) throw err;
	  	img = new Image;
	  	img.src = origin;
	  	ctx.drawImage(img, 85, 530, 125, 125);

		fs.readFile(__dirname + '/portrait.png', function(err, origin) {

			img = new Image;
		  	img.src = origin;

		  	if (err) throw err;

		  	ctx.beginPath();  
		  	ctx.translate(0,0);  

		    ctx.arc(270, 592.5, 50, 0, Math.PI * 2, true);  

		    ctx.clip()

		  	ctx.drawImage(img, 220, 542.5, 100, 100);

		  	stream = canvas.createPNGStream();
		  	stream.on('data', function(chunk){
			  	outStream.write(chunk);
		  	});
		});
	});
});




