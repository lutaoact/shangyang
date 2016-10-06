'use strict';

const _ = require('lodash');
const moment = require('moment');
const _u = require('../common/util');
const AppErr = require('../common/AppErr');
const loggerD = _u.loggerD;
const logger = _u.logger;

const weixin = require('../common/weixin');

const User = _u.model('User');
const Message = _u.model('Message');
const Invitation = _u.model('Invitation');
const redisService = _u.service('redis');


function getSubscribeMessage(opt, cb) {
  // 返回所有被邀请关注的消息
  if (opt && opt.invitation) {

  }
  // 返回所有没有被邀请的关注消息
  else if (opt && !opt.invitation) {

  }
  // 返回所有关注消息
  else {
    Message.find({'content.Event':'subscribe'}, {'FromUserName'}, function(err, messages) {
      cb(messages);
    });
  }
}
exports.getSubscribeMessage = getSubscribeMessage;
