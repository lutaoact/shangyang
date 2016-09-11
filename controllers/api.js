'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const wechat = require('wechat');
const _u = require('../common/util');

const weixin = require('../common/weixin')



// /api/user?abtest=1&from=1479686400000&to=1479686400000&interval=10
exports.user = (req, res, next) => {

  const abtest = req.query.abtest;
  const from = req.query.from;
  const tor = req.query.to;

  res.payload('Hello, world');
}
