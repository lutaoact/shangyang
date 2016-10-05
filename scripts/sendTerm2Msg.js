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


function processMessage(openId, cb) {
  console.log('openId:', openId);
  _u.mySeries({
    // inviterUser: (_cb) => {
    //   //如果不是被人邀请进来的，那啥都不用做
    //   if (message.EventKey === '') {
    //     loggerD.write('[Recv] No Invitation Subscribe:', '[From]', openid);
    //     return _cb();
    //   }
    //   inviterIncrId = +message.EventKey.replace(/^qrscene_/, '');
    //   User.findOne({incrId: inviterIncrId}, _cb);
    // },
    // user: (_cb, ret) => {
    //   if (ret.inviterUser && ret.inviterUser.openid === openid) {//自己扫自己
    //     loggerD.write('[Recv] Self Subscribe:', '[From]', openid);
    //     return _cb(new AppErr('selfAction', null, {openid}));
    //   }
    //   if (ret.inviterUser === null) {
    //     loggerD.write('[Recv] inviterUser null:', inviterIncrId);
    //   }
    //   userService.processSubscribe(openid, ret.inviterUser, _cb);
    // },
    // invitation: (_cb, ret) => {
    //   //如果没有邀请者，那也就不需要添加邀请记录，直接完成
    //   if (!ret.inviterUser) {
    //     return _cb();
    //   }
      //如果不是新用户，似乎没啥好说的，啥都不做了吧
//      if (!ret.user.isNewCreated) {
//        loggerD.write('[Recv] Old User Subscribe:', '[From]', openid);
//        return _cb();
//      }
      sendMsg: (_cb) => {
        loggerD.write('[Send Message]', "Term 2 Message openId" , openId, ret.user.incrId, openid);
        weixin.sendMsgToQualifiedInviter(openid, 70, _cb);
      }
    },
  }, _u.delayRun(cb));
}

