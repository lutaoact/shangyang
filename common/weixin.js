'use strict';

const fs = require('fs');
const request = require('request');

const ImageComposer = require('../common/ImageComposer/')

const cache = require('./cache');

const APPID     = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

const API_BASE = 'https://api.weixin.qq.com/cgi-bin';
const MP_BASE = 'https://mp.weixin.qq.com/cgi-bin';
const tokenUrl = `${API_BASE}/token`;
const createQrcodeUrl = `${API_BASE}/qrcode/create`;
const showQrcodeUrl = `${MP_BASE}/showqrcode`;
const addMaterialUrl = `${API_BASE}/material/add_material`;

// GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
function getAccessToken(cb) {
  let qs = {grant_type: 'client_credential', appid: APPID, secret: APPSECRET};
  cache.get('weixinAccessToken', (_cb) => {
    request.get({url: tokenUrl, qs, json: true,}, (err, response, resBody) => {
      if (err) return _cb(err);
      _cb(null, resBody.access_token);
    });
  }, cb);
}
exports.getAccessToken = getAccessToken;

// POST https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
function createQrcode(accessToken, openid, cb) {
  let options = {
    url: createQrcodeUrl, qs: {access_token: accessToken}, json: true,
    body: {
      action_name: 'QR_LIMIT_STR_SCENE',
      action_info: {scene: {scene_str: openid}},
    },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);//{"ticket":"xxxx","url":"yyyy"}
  });
}
exports.createQrcode = createQrcode;

// GET https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET
function showQrcode(ticket, openid, cb) {
  let url = `${showQrcodeUrl}?ticket=${encodeURIComponent(ticket)}`;
  console.log(url);
  let imageSrc = `./static/${openid}.png`;
  let stream = request(url)
    .on('error', (err) => {
      cb(err);
    })
    .pipe(fs.createWriteStream(imageSrc))
    .on('error', (err) => {
      cb(err);
    });

  stream.on('finish', () => {
    console.log(`finish download: ${imageSrc}`);
    cb(null, imageSrc);
  });
}
exports.showQrcode = showQrcode;

// POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN
function uploadImg(accessToken, imgPath, cb) {
  let options = {
    url: addMaterialUrl, qs: {access_token: accessToken}, json: true,
    formData: { type: 'image', media: fs.createReadStream(imgPath) },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);//{"media_id":"xxxx","url":"yyyy"}
  });
}
exports.uploadImg = uploadImg;

function generateQrCodeForOneUser(openid, cb) {
  _u.mySeries({
    token: (_cb) => {
      weixin.getAccessToken(_cb);
    },
    qrcode: (_cb, ret) => {
      weixin.createQrcode(ret.token, openid, _cb);
    },
    qrcodePngPath: (_cb, ret) => {
      weixin.showQrcode(ret.qrcode.ticket, openid, _cb);
    },
    composePath: (_cb, ret) => {
      const imgComposer = new ImageComposer();
      imgComposer.compose({
        qrcodeSrc: ret.qrcodePngPath, outputPath: './static/outputName2.png'
      }, _cb);
    },
    upload: (_cb, ret) => {
      weixin.uploadImg(ret.token, ret.composePath, _cb);
    }
  }, (err, ret) => {
    if (err) return cb(err);
    cb(null, {
      ticket: ret.qrcode.ticket,
      mediaId: ret.upload.media_id,
      url: ret.upload.url,
    });
  });
}
