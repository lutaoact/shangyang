'use strict';

const request = require('request');

const cache = require('./cache');

const APPID = 'wx8b20d81c2353e8cd';
const APPSECRET = 'c89b14a7745377a910a1ad6df4924cfa';

const BASEURL = 'https://api.weixin.qq.com/cgi-bin';
const tokenUrl = `${BASEURL}/token`;

function getAccessToken(cb) {
  let qs = {
    grant_type: 'client_credential',
    appid: APPID, secret: APPSECRET
  };
  cache.get('weixinAccessToken', (_cb) => {
    request.get({url: tokenUrl, qs, json: true,}, (err, response, body) => {
      if (err) return _cb(err);
      _cb(null, body.access_token);
    });
  }, cb);
}
exports.getAccessToken = getAccessToken;
//getAccessToken(console.log);//直接可以在这里测试，能拿到token
