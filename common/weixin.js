'use strict';

const fs = require('fs');
const request = require('request');

const cache = require('./cache');

const APPID     = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

const API_BASE = 'https://api.weixin.qq.com/cgi-bin';
const MP_BASE = 'https://mp.weixin.qq.com/cgi-bin';
const tokenUrl = `${API_BASE}/token`;
const createQrcodeUrl = `${API_BASE}/qrcode/create`;
const showQrcodeUrl = `${MP_BASE}/showqrcode`;

// GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
function getAccessToken(cb) {
  let qs = {
    grant_type: 'client_credential',
    appid: APPID, secret: APPSECRET
  };
  cache.get('weixinAccessToken', (_cb) => {
    request.get({url: tokenUrl, qs, json: true,}, (err, response, resBody) => {
      if (err) return _cb(err);
      _cb(null, resBody.access_token);
    });
  }, cb);
}
exports.getAccessToken = getAccessToken;

// POST https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
function createQrcode(accessToken, cb) {
  let options = {
    url: createQrcodeUrl, qs: {access_token: accessToken}, json: true,
    body: {
      action_name: 'QR_LIMIT_SCENE',
      action_info: {scene: {scene_id: 123}},
    },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);//{"ticket":"xxxx","url":"yyyy"}
  });
}
exports.createQrcode = createQrcode;

// GET https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET
function showQrcode(ticket, cb) {
  let url = `${showQrcodeUrl}?ticket=${encodeURIComponent(ticket)}`;
  console.log(url);
  let imageSrc = './routes/2.png';
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
