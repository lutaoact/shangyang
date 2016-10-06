'use strict';

const async = require('async');
const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('../common/AppErr');

const messageService = _u.service('message');

const weixin = require('../common/weixin');
const redisService = _u.service('redis');

const openId = 'o0zx1s4KfSsw4yOo74g1o3P78DW4';

function getMessage(cb) {
  _u.mySeries({
    noInviteMessage: (_cb) => {
      messageService.getSubscribeMessage({invitation: false}, _cb);
    },
    inviteMessage: (_cb, ret) => {
      messageService.getSubscribeMessage({invitation: true}, _cb);
    },
    threshold: (_cb, ret) => {
      for (let i=0; i<noInviteMessage.length; i++) {
        let userId = noInviteMessage[i].content.FromUserName;
        console.log(userId);
      }
      _cb(null, ret);
    }
  },cb);
};

getMessage((err, ret) => {
  console.log(ret.allMessage.length);
  console.log(ret.inviteMessage.length);
})
