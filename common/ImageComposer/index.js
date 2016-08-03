'use strict';

const fs = require('fs');
const Canvas = require('canvas')
const Promise = require('bluebird')

const WIDTH = 400;
const HEIGHT = 710;
const BOTTOM_HEIGHT = 65; // 二维码距底部距离
const SPACE = 20; // 头像和二维码间距

const canvas = new Canvas(WIDTH, HEIGHT);
const Image = Canvas.Image;
const ctx = canvas.getContext('2d')

const BACKGROUND = {
  SRC: __dirname + '/example/background.jpg',
  X: 0,
  Y: 0,
  WIDTH: WIDTH,
  HEIGHT: HEIGHT
};

const QRCODE = {
  SRC: __dirname + '/example/qrcode.jpg',
  WIDTH: 125
}

const PORTRAIT = {
  SRC: __dirname + '/example/portrait.png',
  RADIUS: 50
}

const ImageComposer = function (qrcode, portrait, background ) {
  this.qrcode = qrcode || QRCODE;
  this.portrait = portrait || PORTRAIT;
  this.background = background || BACKGROUND;
  this.output = {};
};

ImageComposer.prototype.drwaBackground = function (src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, image) => {
      if (err) return reject(err);
      let img = new Image;
      img.src = image;
      ctx.drawImage(img, this.background.X,
              this.background.Y,
              this.background.WIDTH,
              this.background.HEIGHT);
      resolve();
    });
  });
};

ImageComposer.prototype.drawQrcode = function (src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, origin) => {
      if (err) return reject(err);
      let img = new Image;
      img.src = origin;
      ctx.drawImage(img, this.background.WIDTH / 2 - this.qrcode.WIDTH,
        this.background.HEIGHT - this.qrcode.WIDTH - BOTTOM_HEIGHT,
        this.qrcode.WIDTH,
        this.qrcode.WIDTH);
      resolve();

    });
  });
};

ImageComposer.prototype.drawPotrait = function (src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, origin) => {
      if (err) return reject(err);

      let img = new Image;
      img.src = origin;

      if (err) return err;

      ctx.beginPath();
      ctx.translate(0,0);

      ctx.arc(
        this.background.WIDTH / 2 + SPACE + this.portrait.RADIUS,
        this.background.HEIGHT - this.qrcode.WIDTH / 2 - BOTTOM_HEIGHT,
        this.portrait.RADIUS, 0, Math.PI * 2, true);

      ctx.clip()

      ctx.drawImage(img,
        this.background.WIDTH / 2 + SPACE,
        this.background.HEIGHT - this.qrcode.WIDTH / 2 - BOTTOM_HEIGHT - this.portrait.RADIUS,
        this.portrait.RADIUS * 2,
        this.portrait.RADIUS * 2);

      resolve();
    });

  });
};

ImageComposer.prototype.ouput = function (output) {
  return new Promise(function (resolve, reject) {
    const outStream = fs.createWriteStream(output)
    const stream = canvas.createPNGStream();

    stream.on('data', function(chunk){
      outStream.write(chunk);
      resolve();
    });
  });
};
ImageComposer.prototype.compose = function (opt, callback) {

  if (opt) {
    this.background.src = opt && opt.backgroundSrc || this.background.SRC;
    this.qrcode.src = opt && opt.qrcodeSrc || this.qrcode.SRC;
    this.portrait.src = opt && opt.portraitSrc || this.portrait.SRC;
    this.output.src = opt && opt.outputPath;
  }

  this.drwaBackground(this.background.src)
    .then(() => this.drawQrcode(this.qrcode.src))
    .then(() => this.drawPotrait(this.portrait.src))
    .then(() => this.ouput(this.output.src))
    .then(() => { callback && callback(null, this.output.src)})
    .catch((err) => {
      console.error('Error: ' + err);
      callback && callback(err);
    })
};

module.exports = ImageComposer;
