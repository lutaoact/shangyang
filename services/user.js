'use strict';

const _ = require('lodash');
const moment = require('moment');
const _u = require('../common/util');
const loggerD = _u.loggerD;
const logger = _u.logger;

const weixin = require('../common/weixin');

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
        _cb(null, user);
      });
    },
    userWithMediaId: (_cb, ret) => {
      //如果已经生成过二维码，无需重新生成，直接返回
      if (ret.user.mediaId) return _cb(null, ret.user);

      updateMediaIdForUser(openid, _cb);
    },
  }, (err, ret) => {
    cb(err, ret.userWithMediaId);
  });
};

function updateMediaIdForUser(openid, cb) {
  _u.mySeries({
    weixin: (_cb) => {
      weixin.generateQrCodeForOneUser(openid, _cb);
    },
    updatedUser: (_cb, ret) => {//返回更新后的doc
      User.findOneAndUpdate({openid}, ret.weixin, {new: true}, _cb);
    },
  }, (err, ret) => {
    if (err) return cb(err);
    cb(null, ret.updatedUser);
  });
}
