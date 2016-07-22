'use strict';

const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const _u = require('../common/util');
const logger = _u.logger;
const AppErr = require('../common/AppErr');

const redisdb = require('../common/redis');

const tokenRedis    = redisdb.token;
const dataRedis     = redisdb.data;
const alarmRedis    = redisdb.alarm;
const abnormalRedis = redisdb.abnormal;

const redisKey = {
  verifyCode: (mobile) => { return `verify:${mobile}`; },
  effect: (hylandaId) => { return `effect:${hylandaId}`; },
  effectRank: () => { return `er:${_u.formatDate()}`; },
  hostCountMap: (hylandaId) => {
    return `hostCount:${_u.formatDate()}:${hylandaId}`;
  },//hostCount:20160315:10731068921003
  sourceTypeCount: (hylandaId) => {
    return `sourceTypeCount:${hylandaId}`;
  },//sourceTypeCount:10731068921003
  dptUrlCrcs: (hylandaId) => { return `dpt:${hylandaId}:urlCrcs`; },
  dptReducedCount: 'dpt:reducedCount',
  dptTotalCount: (hylandaId) => { return `dpt:${hylandaId}:totalCount`; },
  goOnUpdateCount: (hylandaId) => {
    return `dpt:${hylandaId}:goOnUpdateCount`;
  },
};

exports.setVerifyCode = (mobile, verifyCode, cb) => {//十分钟后过期
  tokenRedis.set(redisKey.verifyCode(mobile), verifyCode, 'EX', 600, cb);
};

exports.getVerifyCode = (mobile, cb) => {
  tokenRedis.get(redisKey.verifyCode(mobile), cb);
};

function getKey2NumberValueMap(hkey, cb) {
  dataRedis.hgetall(hkey, makeCallbackConvertS2N(cb));
}

exports.getUserAccessToken = (uid, cb) => {
  tokenRedis.hget(`common:${uid}`, 'access', cb);
};

exports.checkUserAccessToken = (uid, token, cb) => {
  tokenRedis.hget(`common:${uid}`, 'access', (err, result) => {
    if (err) return cb(err);
    if (token !== result) {
      return cb(new AppErr('unauthorized', 401, {uid: uid, token: token}));
    }
    cb();
  });
};

exports.setUserAccessToken = (uid, token, cb) => {
  tokenRedis.hset(`common:${uid}`, 'access', token, cb);
};

exports.savePolicyChanges = (changeList, cb) => {
  logger.info('userPolicyChange', changeList);
  alarmRedis.rpush('userPolicyChange', changeList, cb);
};

exports.setHostWeightMap = (hostWeightMap, cb) => {
  dataRedis.hmset('hostWeightMap', hostWeightMap, cb);
};

function makeCallbackConvertS2N(cb) {//convert string to number
  return (err, map) => {
    if (err) return cb(err);
    _.each(map, (value, key) => {
      map[key] = +value;
    });
    cb(null, map);
  };
}

exports.getHostWeightMap = (cb) => {
  getKey2NumberValueMap('hostWeightMap', makeCallbackConvertS2N(cb));
};

function incrCount(hylandaId, generateKeyFunc, countMap, cb) {
  let hkey = generateKeyFunc(hylandaId);
  async.forEachOf(countMap, (count, key, _cb) => {
    dataRedis.hincrby(hkey, key, count, _cb);
  }, cb);
}

exports.incrHostCount = (hylandaId, infoHostCount, cb) => {
  incrCount(hylandaId, redisKey.hostCountMap, infoHostCount, cb);
};

exports.getHostCountMap = (hylandaId, cb) => {
  getKey2NumberValueMap(redisKey.hostCountMap(hylandaId), cb);
};

exports.incrSourceTypeCount = (hylandaId, sourceTypeCount, cb) => {
  incrCount(hylandaId, redisKey.sourceTypeCount, sourceTypeCount, cb);
};

exports.getSourceTypeCountMap = (hylandaId, cb) => {
  getKey2NumberValueMap(redisKey.sourceTypeCount(hylandaId), cb);
};

exports.getHylandaIdsForComputingEffect = (cb) => {
  dataRedis.keys(`hostCount:${_u.formatDate()}:*`, (err, keys) => {
    if (err) return cb(err);
    cb(null, _.map(keys, (key) => {
      return key.split(':')[2];//info:20160315:10731068921003 第三段为hylandaId
    }));
  });
};

exports.hsetEffect = (hylandaId, value, cb) => {
  dataRedis.hset(redisKey.effect(hylandaId), _u.formatDate(), value, cb);
};

exports.zaddEffect = (rid, value, cb) => {
  dataRedis.zadd(redisKey.effectRank(), value, rid, cb);
};

exports.getEffectRank = (start, end, sort, cb) => {
  let funcName = `z${sort ? '' : 'rev'}range`;
  dataRedis[funcName](redisKey.effectRank(), start, end, 'withscores', cb);
};

exports.hgetEffect = (hylandaId, cb) => {
  dataRedis.hget(redisKey.effect(hylandaId), _u.formatDate(), (err, v) => {
    cb(err, v ? +v : 0);
  });
};

exports.hvalsEffectSum = (hylandaId, cb) => {
  dataRedis.hvals(redisKey.effect(hylandaId), (err, vals) => {
    if (err || !vals) return cb(err, 0);
    cb(null, _.sumBy(vals, (v) => {return +v}));
  });
};

exports.hmgetEffects = (hylandaId, dates, cb) => {
  dataRedis.hmget(redisKey.effect(hylandaId), dates, cb);
};

exports.zscanUrlCrcs = (hylandaId, cursor, cb) => {
  let key = redisKey.dptUrlCrcs(hylandaId);
  dataRedis.zscan(key, cursor, 'count', 90, (err, list) => {
    if (err) return cb(err);
    cb(null, _.filter(list, function(value, index) {
      return index % 2 === 0;
    }));
  });
};

exports.zaddUrlCrcs = (hylandaId, urlCrcs, cb) => {
  if (urlCrcs.length === 0) return cb();
  let now = _u.timestamp();
  let args = _.concat.apply(_, _.map(urlCrcs, (u) => { return [now, u]; }));
  let key = redisKey.dptUrlCrcs(hylandaId);
  dataRedis.zadd(key, args, cb);
};

exports.zremUrlCrcs = (hylandaId, urlCrcs, cb) => {
  if (urlCrcs.length === 0) return cb();
  let key = redisKey.dptUrlCrcs(hylandaId);
  dataRedis.zrem(key, urlCrcs, cb);
};

exports.incrDptReducedCount = (hylandaId, countChange, cb) => {
  if (countChange === 0) return cb();
  dataRedis.hincrby(redisKey.dptReducedCount, hylandaId, countChange, cb);
};

function setDptCountMap(hylandaId, generateKeyFunc, countMap, cb) {
  if (_.isEmpty(countMap)) return cb();
  dataRedis.hmset(generateKeyFunc(hylandaId), countMap, cb);
}

exports.setGoOnUpdateCount = (hylandaId, countMap, cb) => {
  setDptCountMap(hylandaId, redisKey.goOnUpdateCount, countMap, cb);
};

exports.getGoOnUpdateCount = (hylandaId, cb) => {
  getKey2NumberValueMap(redisKey.goOnUpdateCount(hylandaId), cb);
};

exports.sumGoOnUpdateCount = (hylandaId, cb) => {
  let hkey = redisKey.goOnUpdateCount(hylandaId);
  dataRedis.hvals(hkey, (err, values) => {
    if (err) return cb(err);
    cb(null, _.sumBy(values, parseInt));
  });
};

exports.getDptReducedCount = (hylandaId, cb) => {
  dataRedis.hget(redisKey.dptReducedCount, hylandaId, cb);
};

exports.getYesterdayTotalCount = (hylandaId, cb) => {
  let yesterday = moment().subtract(1, 'd').format('YYYYMMDD');
  dataRedis.hget(redisKey.dptTotalCount(hylandaId), yesterday, cb);
};

exports.delUrlCrcsFromGoOnUpdateCount = (hylandaId, urlCrcsToRem, cb) => {
  if (urlCrcsToRem.length === 0) return cb();
  let hkey = redisKey.goOnUpdateCount(hylandaId);
  dataRedis.hdel(hkey, urlCrcsToRem, cb);
};

exports.setDptTotalCount = (hylandaId, count, cb) => {
  let hkey = redisKey.dptTotalCount(hylandaId);
  dataRedis.hset(hkey, _u.formatDate(), count, cb);
};

exports.statsWord = (word, rtype, rid, cb) => {
  dataRedis.multi([
    ['zadd', 'searchWordsTime', _u.timestamp(), word],
    ['zincrby', 'searchWordsCount', 1, word],
    ['hset', 'searchWordsMap', word, `${rtype}:${rid}`],
  ]).exec(cb);
};

exports.zunionstoreWords = (cb) => {
  dataRedis.zunionstore(
    'searchWords', 2, 'searchWordsTime', 'searchWordsCount',
    'weights', 1, 86400 / 5,
    'aggregate', 'sum',
    cb
  );//搜5次，相当于更新1天
};

exports.zrevrangeWords = (cb) => {
  dataRedis.zrevrange('searchWords', 0, 19, (err, words) => {
    if (err) return cb(err);
    cb(null, _.sampleSize(words, 10));
  });
};

exports.hmgetSearchWords = (words, cb) => {
  if (_.isEmpty(words)) return cb(null, []);
  dataRedis.hmget('searchWordsMap', words, cb);
};

exports.hsetNoticeTitle = (title, cb) => {
  let today = moment().format('YYYYMMDD');
  let key = 'noticeTitleList:' + today
  dataRedis.hset(key, title, "1", cb);
};

exports.hgetallNoticeTitle = (cb) => {
  let today = moment().format('YYYYMMDD');
  let key = 'noticeTitleList:' + today
  dataRedis.hgetall(key, cb);
};

exports.batchPushAbnormals = (abnormals, cb) => {
  if (_.isEmpty(abnormals)) return cb();

  async.forEachOf(abnormals, (list, key, _cb) => {
    let listKey = `abnormal:${key}`;
    abnormalRedis.multi()
      .lpush(listKey, _.map(list, JSON.stringify))
      .ltrim(listKey, 0, 49)
      .exec(_cb);
  }, cb);
};

exports.getAbnormals = (eCode, sourceType, cb) => {
  let lkey = `abnormal:${eCode}:${sourceType}`;
  abnormalRedis.lrange(lkey, 0, -1, (err, strList) => {
    if (err) return cb(err);
    cb(null, _.map(strList, JSON.parse));
  });
};

exports.setAnalystReportNextId = (value, cb) => {
  dataRedis.set('analystReportNextId', value, cb);
};

exports.getAnalystReportNextId = (cb) => {
  dataRedis.get('analystReportNextId', cb);
};

exports.clearUselessForHylandaId = (hylandaId, cb) => {
  let totalCountKey      = redisKey.dptTotalCount(hylandaId);
  let goOnUpdateCountKey = redisKey.goOnUpdateCount(hylandaId);
  let urlCrcsKey         = redisKey.dptUrlCrcs(hylandaId);
  dataRedis.multi([
    ['hdel', redisKey.dptReducedCount, hylandaId],
    ['del', totalCountKey],
    ['del', goOnUpdateCountKey],
    ['del', urlCrcsKey],
  ]).exec(cb);
};
