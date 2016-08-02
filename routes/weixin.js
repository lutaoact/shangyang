'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const wechat = require('wechat');
const _u = require('../common/util');

const weixin = require('../common/weixin')


router.get('/getToken', (req, res, next) => {
  weixin.getAccessToken((err, token) => {
    if (err) return next(err);
    res.payload(token);
  });
});

router.get('/getQRCode', (req, res, next) => {
  let openid = 'oSB10w52vUxOabF1FAPB13uyne8g';
  weixin.generateQrCodeForOneUser(openid, (doc) => {
    if (err) return next(err);
    res.payload();
  });
});

module.exports = router;
