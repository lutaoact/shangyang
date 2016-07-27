'use strict';

const _ = require('lodash');
const async = require('async');
const redisdb = require('./redis');

const dataRedis = redisdb.data;

exports.get = (key, cacheMissCallback, cb) => {
  dataRedis.get(key, (err, value) => {
    if (err) return cb(err);
    if (value) return cb(null, value);

    cacheMissCallback((err, data) => {
      if (err) return cb(err);
      if (!data) return cb(new AppErr('valueErr', null, {key, expire, data}));

      dataRedis.set(key, data, 'ex', 7000, (err) => {
        if (err) return cb(err);
        cb(null, data);
      });
    });
  });
};
