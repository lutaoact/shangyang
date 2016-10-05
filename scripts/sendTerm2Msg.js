'use strict';

const async = require('async');
const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('../common/AppErr');

const userService = _u.service('user');
const User = _u.model('User');
const weixin = require('../common/weixin');
const redisService = _u.service('redis');

const openId = [

  "o0zx1sw-idG3ZogRtK5L-xqdrKr4",

];



async.eachSeries(openId, sendMsg, console.log);


function sendMsg(openId, cb) {
  console.log('openId:', openId);
  // let rank = 70;
  _u.mySeries({
    getRank: (_cb) => {
      let rank = redisService.getQualifiedRank(openId, _cb);
      console.log('rank:', rank);

    },
    sendMsg: (_cb, ret) => {
      console.log(ret.rank);
      // loggerD.write('[Send Message]', "Term 2 Message openId" , openId, 'rank', rank);
      // weixin.sendMsgToQualifiedInviter(openId, rank, _cb);
    },
  }, _u.delayRun(cb));
}

