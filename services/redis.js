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

exports.saddInvitee = (inviter, invitee, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.sadd(key, invitee, cb);
};

exports.getInvitees = (inviter, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.scard(key, cb);
};

exports.getUserIncrId = (cb) => {
  dataRedis.incr('userIncrId', cb);//每次加1
};
