'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const wechat = require('wechat');
const _u = require('../common/util');

const weixin = require('../common/weixin')

const User = _u.model('User');


// /api/user?threshold=1&from=1479686400000&to=1479686400000&interval=10
exports.user = (req, res, next) => {

  const threshold = req.query.threshold;
  const from = req.query.from;
  const tor = req.query.to;

  User.count((req, res) => {
    console.log(arguments)
    res.payload(res);
  });
}
