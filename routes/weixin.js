'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const wechat = require('wechat');
const _u = require('../common/util');

const ImageComposer = require('../common/ImageComposer/')
const weixin = require('../common/weixin')

const APPID     = process.env.APPID;

router.get('/getToken', (req, res, next) => {
  weixin.getAccessToken((err, token) => {
    if (err) return next(err);
    res.payload(token);
  });
});

router.get('/getQRCode', (req, res, next) => {
  _u.mySeries({
    token: (_cb) => {
      weixin.getAccessToken(_cb);
    },
    qrcode: (_cb, ret) => {
      weixin.createQrcode(ret.token, _cb);
    },
    qrcodePngPath: (_cb, ret) => {
      weixin.showQrcode(ret.qrcode.ticket, _cb);
    },
    compose: (_cb, ret) => {
      const imgComposer = new ImageComposer();
      imgComposer.compose({
        qrcodeSrc: ret.qrcodePngPath, outputPath: './routes/outputName2.png'
      }, _cb);
    },
  }, (err, ret) => {
    if (err) return next(err);
    res.payload();
  });
});

const config = {
  token: 'weixin',
  appid: APPID,
  encodingAESKey: 'wmYBjHcEYQmRC0aPMJ556u5oAdpYD5NIlPMijX72hKY'
};

router.get('/', wechat(config, (req, res, next) => {

  // 用于微信接口验证
  if (req.query && req.query.echostr) {
    res.end(req.query.echostr);
  }

  // 微信输入信息都在req.weixin上
  var message = req.weixin;
    res.reply('hehe');
}));

module.exports = router;
