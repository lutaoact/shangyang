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

const openId = 'o0zx1s4KfSsw4yOo74g1o3P78DW4';

const FSceneIds = [
  'FScene_0',
  'FScene_1',
  'FScene_2',
  'FScene_3',
  'FScene_4',
  'FScene_5',
  'FScene_6',
  'FScene_7',
  'FScene_8',
  'FScene_9',
];

async.eachSeries(FSceneIds, sendMsg, console.log);


function sendMsg(FSceneId, cb) {
  console.log('openId:', openId);
  // let rank = 70;
  _u.mySeries({
    qrcode: (_cb) => {
      weixin.createForeverQrcode(FSceneId, _cb);
    },
    qrcodePngPath: (_cb, ret) => {
      weixin.showQrcode(ret.qrcode.ticket, FSceneId, _cb);
    },
    // sendText: (_cb, ret) => {
    //   let msgBody = {
    //     touser: openid, msgtype: "text",
    //     text: { content: sprintf(constants.msgMap[term], rank) }
    //   };
    //   sendCustomerMsgWithToken(msgBody, _cb);
    // },
    sendQrCode: (_cb, ret) => {
      // if (term > 2) return _cb();
      weixin.sendImage(openId, `./static/${FSceneId}.png`, _cb);
    },
  }, _u.delayRun(cb, 2000));
}

