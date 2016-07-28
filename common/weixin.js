'use strict';

const request = require('request');

const cache = require('./cache');

const APPID = 'wx8b20d81c2353e8cd';
const APPSECRET = 'c89b14a7745377a910a1ad6df4924cfa';

const BASEURL = 'https://api.weixin.qq.com/cgi-bin';
const tokenUrl = `${BASEURL}/token`;
const qrcodeUrl = `${BASEURL}/qrcode/create`;

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
//getAccessToken(console.log);//直接可以在这里测试，能拿到token

function createQrcode(accessToken, cb) {
  let options = {
    url: qrcodeUrl, qs: {access_token: accessToken}, json: true,
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
//createQrcode('6lGBb3aoth8_PSsAwfjqG5U0gDFOzsWqE8uZ7ea-FxbxM3CZyWj0eMY7d4oUf8Qs9Y0eVxPqEHeaN-QGDDO1lTS0jTnvABF-gHyEb3vVm1rk1e8Cudp9-JOsOhUBLHsnXHDiAJAFPL', console.log);
