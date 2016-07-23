const ImageComposer = require('../index.js');

const imgComposer = new ImageComposer();

imgComposer.compose({
	backgroundSrc: __dirname + '/background.jpg', 
	qrcodeSrc: __dirname + '/qrcode.jpg',
	portraitSrc: __dirname + '/portrait.png',
	outputPath: __dirname + '/outputName.png'
});