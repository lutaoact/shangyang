'use strict';

const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const _u = require('../common/util');
const logger = _u.logger;
const AppErr = require('../common/AppErr');

const redisdb = require('../common/redis');

const dataRedis = redisdb.data;

const redisKey = {
  inviter: (inviter) => { return `i:${inviter}`; },
};

exports.addInvitee = (inviter, invitee, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.zadd(key, +moment(), invitee, cb);
};

exports.getInviterScore = (inviter, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.zcard(key, cb);
};

exports.getUserIncrId = (cb) => {
  dataRedis.incr('userIncrId', cb);//每次加1
};
