'use strict';

const _ = require('lodash');
const moment = require('moment');
const _u = require('../common/util');
const loggerD = _u.loggerD;
const logger = _u.logger;

const weixin = require('../common/weixin');

const User = _u.model('User');
const Invitation = _u.model('Invitation');
const redisService = _u.service('redis');


exports.processInvitation = (inviter, openid, cb) => {
  _u.mySeries({
    invitation: (_cb) => {
      Invitation.create({inviter, invitee: openid}, _cb);
    },
    saveToRedis: (_cb) => {
      redisService.saddInvitee(inviter, openid, _cb);
    },
  }, cb);
};

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
    mediaId: (_cb, ret) => {
      //如果已经生成过二维码，无需重新生成，直接返回
      // if (ret.user.mediaId) return _cb(null, ret.user.mediaId);
      
      updateMediaIdForUser(openid, _cb);
    },
    // 发送积分变动消息（模板消息）给当前用户及其邀请者（如果有的话）
    score: (_cb, ret) => {
      
      setTimeout(function() {
        weixin.sendScoreMessage(openid);
      }, 2000);

      _cb();
    }
  }, (err, ret) => {
    console.log(ret)
    ret.user.mediaId = ret.mediaId
    cb(err, ret.user);
  });
};

function updateMediaIdForUser(openid, cb) {
  _u.mySeries({
    weixin: (_cb) => {
      weixin.generateQrCodeForOneUser(openid, _cb);
    },
    update: (_cb, ret) => {//返回更新后的doc
      User.update({openid}, ret.weixin, _cb);
    },
  }, (err, ret) => {
    if (err) return cb(err);
    cb(null, ret.weixin.mediaId);
  });
}
