'use strict';

const _ = require('lodash');
const moment = require('moment');
const _u = require('../common/util');
const AppErr = require('../common/AppErr');
const loggerD = _u.loggerD;
const logger = _u.logger;

const weixin = require('../common/weixin');

const User = _u.model('User');
const Invitation = _u.model('Invitation');
const redisService = _u.service('redis');

function createOne(openid, inviterUser, cb) {
  _u.mySeries({
    incrId: (_cb) => {
      redisService.getUserIncrId(_cb);
    },
    user: (_cb, ret) => {
      //for abtest: 被邀请用户使用邀请者的threshold，没有邀请者则随机抽取
      let threshold = inviterUser
                        ? inviterUser.threshold
                        : _.sample([1, 2, 3, 5]);
      let data = {openid, incrId: ret.incrId, threshold};
      User.create(data, _cb);
    },
  }, (err, ret) => {
    if (err) return cb(err);
    ret.user = ret.user.toObject();
    ret.user.isNewCreated = true;//标识新用户
    cb(null, ret.user);
  });
}

exports.getAllUsers = (condition, fields, cb) => {
  User.find(condition, fields, (err, users) => {
    cb(err, users);
  });
};

exports.processInvitation = (inviterUser, invitee, cb) => {
  let inviter   = inviterUser.openid;
  let threshold = inviterUser.threshold;
  _u.mySeries({
    invitation: (_cb, ret) => {
      loggerD.write('[Invitation] Create Invitation:', '[Inviter]',
        inviter, '[Invitee]', invitee);
      Invitation.update({inviter, invitee}, {inviter, invitee}, {upsert: true}, _cb);
    },
    saveToRedis: (_cb, ret) => {
      redisService.addInvitee(inviter, invitee, _cb);
    },
//    score: (_cb, ret) => {// 发送积分变动消息（模板消息）给其邀请者
//      weixin.sendScoreMessage(inviter, invitee, inviterUser, _cb);
//    },
//    sendGroupQrcode: (_cb, ret) => {
//      weixin.sendGroupQrcode(inviter, threshold, _cb);
//    },
  }, cb);
};

function updateUserInfo(user, cb) {
  _u.mySeries({
    userInfo: (_cb) => {
      weixin.getUserInfo(user.openid, _cb);
    },
    update: (_cb, ret) => {
      user.info = ret.userInfo;
      User.update({openid: user.openid}, {info: ret.userInfo}, _cb);
    },
  }, (err, ret) => {
    cb(err, user);
  });
}

exports.processSubscribe = (openid, inviterUser, cb) => {
  _u.mySeries({
    existedUser: (_cb) => {
      User.findOne({openid}, _cb);
    },
    user: (_cb, ret) => {
      if (ret.existedUser) {
        return _cb(null, ret.existedUser.toObject());
      }
      loggerD.write('[User] Create User:', '[User]', openid);
      createOne(openid, inviterUser, _cb);
    },
    update: (_cb, ret) => {
      updateUserInfo(ret.user, _cb);
    },
    mediaId: (_cb, ret) => {
      updateMediaIdForUser(ret.user, _cb);
    },
    // 生成课程介绍以及报名方式
    welcome: (_cb, ret) => {
      ret.user.mediaId = ret.mediaId
//      sendWelcomeMsg(ret.user, console.log);//利用客服接口发送欢迎消息，异步实现
      _cb();
    },
  }, (err, ret) => {
    cb(err, ret.user);
  });
};

function updateMediaIdForUser(user, cb) {
  _u.mySeries({
    weixin: (_cb) => {
      weixin.generateQrCodeForOneUser(user, _cb);
    },
    update: (_cb, ret) => {//返回更新后的doc
      User.update({openid: user.openid}, ret.weixin, _cb);
    },
  }, (err, ret) => {
    if (err) return cb(err);
    cb(null, ret.weixin.mediaId);
  });
}
exports.updateMediaIdForUser = updateMediaIdForUser;

function sendWelcomeMsg(user, cb) {
  let openid    = user.openid;
  let threshold = user.threshold;
  let mediaId   = user.mediaId;
   _u.mySeries({
    newsMsg: (_cb) => {
      // 课程介绍图文
      loggerD.write('[Send] Introduction News:', '[To]', openid);
      weixin.sendCustomerMsgWithToken({
        touser: openid,
        msgtype: 'news',
        news: {
          articles: [{
            title: '5天主动词汇集训营',
            picurl: 'https://mmbiz.qlogo.cn/mmbiz_jpg/UaXlUaIUiaTtkJNuLWH5DAiaWV08N1kqR1qtt3gkibfs75I0gQCIbDxqoxYe4PRFiamtL7eqJVdNsTbhcxs15yf6QA/0?wx_fmt=jpeg',
            description: '举手, 请问老师: 什么是主动词汇量? 呃呃呃...',
            url: 'http://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000016&idx=1&sn=ee32c334e1ba7af3efc710b190a92aae&scene=20#rd'
          }]
        }
      }, _u.delayRun(_cb));
    },
    textMsg: (_cb, ret) => {
      // 报名规则文本
      loggerD.write('[Send] Rule Text1:', '[To]', openid);
      weixin.sendCustomerMsgWithToken({
        touser: openid,
        msgtype: 'text',
        text: {
        //  content: '报名方法1: 邀请' + threshold +'位好友, 抱团学习, 即可免费参加集训营. 下边是你的专属邀请卡, 把它发给你的想提高英语的好友吧. '
          content: '报名方法1: 免费模式, 邀请' + threshold + '位好友, 你就可以免费参加集训营. 下边是你的专属邀请卡, 把它发到你的微信群或朋友圈, 喊小伙伴来一起学习吧'
        }
      }, _u.delayRun(_cb));
    },
    textMsg2: (_cb, ret) => {
      // 报名规则文本
      loggerD.write('[Send] Rule Text2:', '[To]', openid);
      weixin.sendCustomerMsgWithToken({
        touser: openid,
        msgtype: 'text',
        text: {
          content: '报名方法2: 付费模式, 如果你不想邀请好友, 那么需要支付学费50元. 点击这里进入付费'
              + '<a href="http://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000031&idx=1&sn=cf5db8e54f6274f7816b12db27b730ac&scene=20#rd">报名通道</a>'
        }
      }, _u.delayRun(_cb));
    },
    sendInvitationQrCode: (_cb, ret) => {
      loggerD.write('[Send] Invitation QRCode:', '[To]', openid, '[MediaId]', mediaId);
      let msgBody = {
        touser: openid, msgtype: "image",
        image: { media_id: mediaId }
      };
      weixin.sendCustomerMsgWithToken(msgBody, _u.delayRun(_cb));
    },
  }, cb);
}
