'use strict';

const _ = require('lodash');
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
    firstQualification: (_cb, ret) => {
      let ob = ret.inviteMessage.map((value) => {
        let incrId = +value.content.EventKey.replace(/^qrscene_/, '');
        let userInfo = _u.getObjFromArrByKeyName(ret.users, incrId, 'incrId');
        return {
          incrId: userInfo ? userInfo.incrId : 0,
          threshold: userInfo ? userInfo.threshold : -1,
        }
      }).filter((value) => {
        let no = ret.noInviteMessage.map((value2) => {
          let openId = value2.content.FromUserName;
          let userInfo = _u.getObjFromArrByKeyName(ret.users, openId, 'openid');
          return userInfo ? userInfo.incrId : 0;
        });
        return no.indexOf(value.incrId) !== -1;
      }).reduce((pre, cur) => {
        pre[cur.incrId] = {
          number: pre[cur.incrId] ? pre[cur.incrId].number+1: 1,
          threshold: cur.threshold, 
        };
        return pre;
      }, {})
      let N3 = _.reduce(ob, (pre, cur) => {
        let info = {};
        if (cur.number >= cur.threshold) {
          pre[cur.threshold] ? pre[cur.threshold]++ : pre[cur.threshold] = 1;
        }
        return pre;
      }, {});
      _cb(null, N3)

    },
    // 计算达标人数
    qualification: (_cb, ret) => {
      let ob = ret.inviteMessage.map((value) => {
        let incrId = +value.content.EventKey.replace(/^qrscene_/, '');
        let userInfo = _u.getObjFromArrByKeyName(ret.users, incrId, 'incrId');
        return {
          incrId: incrId,
          threshold: userInfo ? userInfo.threshold : -1,
        }
      }).reduce((pre, cur) => {
        pre[cur.incrId] = {
          number: pre[cur.incrId] ? pre[cur.incrId].number+1: 1,
          threshold: cur.threshold, 
        };
        return pre;
      }, {})
      let N2 = _.reduce(ob, (pre, cur) => {
        let info = {};
        if (cur.number >= cur.threshold) {
          pre[cur.threshold] ? pre[cur.threshold]++ : pre[cur.threshold] = 1;
        }
        return pre;
      }, {});
      _cb(null, N2)
    },
    //  计算种子分布
    threshold: (_cb, ret) => {
      let N1 = {};
      for (let i = 0; i < ret.noInviteMessage.length; i++) {
        let userId = ret.noInviteMessage[i].content.FromUserName;
        let user = _u.getObjFromArrByKeyName(ret.users, userId, 'openid');
        if (user) {
          let threshold = user['threshold'];
          N1[threshold] ? N1[threshold]++ : N1[threshold] = 1;
        }
        else {
          console.log(user);
          console.log('----')
        }
      }
      _cb(null, N1);
    },
    // 计算最终结果
    result: (_cb, ret) => {
      let N1 = ret.threshold;
      let N2 = ret.qualification;
      let N3 = ret.firstQualification;
      let result = _.reduce(N1, (pre, cur, index) => {
        pre[index] = {};
        pre[index].first = N3[index] * +index / N1[index];
        pre[index].other = (N2[index] - N3[index]) * +index / N1[index];
        return pre;
      }, {});
      _cb(null, result);
    }
  },cb);
};

getMessage((err, ret) => {
  console.log(ret.qualification);
  console.log(ret.firstQualification);
  console.log(ret.threshold);
  console.log(ret.result);
})
