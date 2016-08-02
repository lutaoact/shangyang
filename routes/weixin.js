'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const wechat = require('wechat');
const _u = require('../common/util');

const ImageComposer = require('../common/ImageComposer/')
const weixin = require('../common/weixin')


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

module.exports = router;
