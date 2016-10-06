'use strict';

const async = require('async');
const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('../common/AppErr');

const messageService = _u.service('message');
const userService = _u.service('user');

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
    users: (_cb, ret) => {
      userService.getAllUsers({}, 'openid incrId threshold', _cb);
    },
    // 计算达标人数
    quanlification: (_cb, ret) => {
      let ob = ret.inviteMessage.map((value) => {
        let incrId = +value.content.EventKey.replace(/^qrscene_/, '');
        let userInfo = _u.getObjFromArrByKeyName(ret.users, incrId, 'incrId');
        return {
          incrId: incrId,
          threshold: userInfo.threshold
        }
      }).reduce((pre, cur) => {
        pre[cur.incrId] ? pre[cur.incrId]++ : pre[cur.incrId] = 1;
        return pre;
      }, {});
      console.log(ob);
    }
    threshold: (_cb, ret) => {
      let noInvitation = {};
      for (let i = 0; i < ret.noInviteMessage.length; i++) {
        let userId = ret.noInviteMessage[i].content.FromUserName;
       // console.log(userId);
        // );
        let threshold = _u.getObjFromArrByKeyName(ret.users, userId, 'openid')['threshold'];
        noInvitation[threshold] ? noInvitation[threshold]++ : noInvitation[threshold] = 1;
      }
      console.log(noInvitation)
      //console.log(ret.users);
      _cb(null, ret);
    }
  },cb);
};

getMessage((err, ret) => {

  console.log(ret.users.length);
})
