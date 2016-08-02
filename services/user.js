'use strict';

const _ = require('lodash');
const moment = require('moment');
const _u = require('../common/util');
const loggerD = _u.loggerD;
const logger = _u.logger;

const User = _u.model('User');

exports.processSubscribe = (openid, cb) => {
  _u.mySeries({
    existedUser: (_cb) => {
      User.findOne({openid}, _cb);
    },
    user: (_cb, ret) => {
      if (ret.existedUser) {
        return _cb(null, ret.existedUser.toObject());
      }
      loggerD.write('createUser', openid);
      User.create({openid}, (err, user) => {
        if (err) return _cb(err);
        user = user.toObject();
        user.isNewCreated = true;//标识新用户
        cb(null, user);
      });
    },
    weixin: (_cb, ret) => {
      if (ret.user.mediaId) return _cb();

    },
  }, (err, ret) => {
  });
};
