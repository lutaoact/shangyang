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
  qualifiedRank: 'qr:2016-1',
  qualifiedTime: 'qt:2016-1',
  latestAccess: 'la',
};

exports.addLatestAccess = (openid, cb) => {
  dataRedis.zadd(redisKey.latestAccess, +moment(), openid, cb);
};

exports.addInvitee = (inviter, invitee, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.zadd(key, +moment(), invitee, cb);
};

exports.addFQRCodeSubsribe = (openid, sceneId, cb) => {
  dataRedis.zadd('FScene_'+sceneId, +moment(), openid, cb);
};

exports.getInviterScore = (inviter, cb) => {
  let key = redisKey.inviter(inviter);
  dataRedis.zcard(key, cb);
};

exports.getUserIncrId = (cb) => {
  dataRedis.incr('userIncrId', cb);//每次加1
};

exports.getQualifiedRank = (inviter, cb) => {
  dataRedis.zscore(redisKey.qualifiedRank, inviter, cb);
};

exports.getNextQualifiedRank = (cb) => {
  let key = redisKey.qualifiedRank;
  dataRedis.zrevrange(key, 0, 0, 'withscores', (err, pair) => {
    if (err) return cb(err);
    cb(null, ~~pair[1] + 1);
  });
};

exports.addQualifiedInviterToRank = (inviter, rank, cb) => {
  dataRedis.multi([
    ['zadd', redisKey.qualifiedRank, rank,      inviter],
    ['zadd', redisKey.qualifiedTime, +moment(), inviter],
  ]).exec(cb);
};
