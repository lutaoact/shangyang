/**
 * Module dependencies.
 */

var Canvas = require('canvas')
var canvas = new Canvas(150, 150)
var ctx = canvas.getContext('2d')
var fs = require('fs');
var Image = Canvas.Image;

var outStream = fs.createWriteStream(__dirname + '/state2.png')


ctx.fillRect(0,0,400,400);   // Draw a rectangle with default settings
ctx.save();                  // Save the default state

ctx.fillStyle = '#09F'       // Make changes to the settings
ctx.fillRect(15,15,120,120); // Draw a rectangle with new settings


var img = new Image;
img.dataMode = Image.MODE_IMAGE; // Only image data tracked
img.dataMode = Image.MODE_MIME; // Only mime data tracked
img.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked

fs.readFile(__dirname + '/state.png', function(err, squid){
  if (err) throw err;
  img = new Image;
  img.src = squid;
  ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
});

var img = new Image;
img.src = canvas.toBuffer();
ctx.drawImage(img, 0, 0, 50, 50);
ctx.drawImage(img, 50, 0, 50, 50);
ctx.drawImage(img, 100, 0, 50, 50);


// ctx.save();                  // Save the current state
// ctx.fillStyle = '#FFF'       // Make changes to the settings
// ctx.globalAlpha = 0.5;    
// ctx.fillRect(30,30,90,90);   // Draw a rectangle with new settings

// ctx.restore();               // Restore previous state
// ctx.fillRect(45,45,60,60);   // Draw a rectangle with restored settings

// ctx.restore();               // Restore original state
// ctx.fillRect(60,60,30,30);   // Draw a rectangle with restored settings


var stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  outStream.write(chunk);
});