'use strict';

const async = require('async');
const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('../common/AppErr');

const userService = _u.service('user');
const User = _u.model('User');
const weixin = require('../common/weixin');

const openId = [

  "o0zx1s4KfSsw4yOo74g1o3P78DW4",

];



async.eachSeries(openId, sendMsg, console.log);


function sendMsg(openId, cb) {
  console.log('openId:', openId);
  let rank = 70;
  _u.mySeries({
      sendMsg: (_cb) => {
        loggerD.write('[Send Message]', "Term 2 Message openId" , openId, 'rank', rank);
        weixin.sendMsgToQualifiedInviter(openId, rank, _cb);
      }
  }, _u.delayRun(cb));
}

