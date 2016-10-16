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

const moment = require('moment');

const templateId = 'eLHxc-wK89kjyc2rHDHXCnrPECB4XNqCBJ5q7PU3ytM';
const newsUrl = 'https://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000069&idx=1&sn=9d904d6526c1c14b6bbe7439d6cbf85b&chksm=1b4b8af92c3c03efe8c353c841730c01cb5e0098c93c8de7532bf3bafc8fd6c14ba5e05df82e&mpshare=1&scene=1&srcid=1016BizbJ08rtX1uKK4Tpmm7&pass_ticket=BwSoYubdtPTEHVJZSvcQPYkEeCQsESxjy8691i4sbHvfM4fxCUCzwdQFKpyP7my1#rd';
const openIds = [
{"id": "o0zx1s7gMqY9MSfcpXZDRUyhqWkU"},
{"id": "o0zx1s_knfht-4jFkOmYHg3uHTgc"},
{"id": "o0zx1s9JiPDdh0WN4ht2gsCfJzjo"},
{"id": "o0zx1s_TmxrQz0kbPjcX5z-SFfpw"},
{"id": "o0zx1s4KfSsw4yOo74g1o3P78DW4"},
];



async.eachSeries(openIds, sendMsg, console.log);


function sendMsg(openIdObj, cb) {
  let openId = openIdObj.id;
  console.log('openId:', openId);
  // let rank = 70;
  _u.mySeries({
    rank: (_cb) => {
      redisService.getQualifiedRank(openId, _cb);
    },
    userInfo: (_cb, ret) => {
      weixin.getUserInfo(openId, _cb);
    },
    sendMsg: (_cb, ret) => {
      // console.log(ret.rank);
      console.log(ret.userInfo);
      loggerD.write('[Send News Message]', "Term 3 Message openId" , openId, 'rank', ret.rank);
      // weixin.sendMsgToQualifiedInviter(openId, ret.rank, _cb);

      // 图片消息
      // weixin.sendImage(openId, `./groupQrCode/term2.jpg`, _cb);

      // 文字消息
      // let msg = '恭喜您获得免费参加第三期集训营的资格. 快快扫描上边二维码, 添加集训营营长Iris的微信吧, 她会邀请你加入集训营专属群~';
      // let msgBody = {
      //   touser: openId, msgtype: "text",
      //   text: { content: msg }
      // };
      // weixin.sendCustomerMsgWithToken(msgBody, _cb);

      // 模板消息
      moment.locale('zh-cn');
      weixin.sendTemplateMessageWithToken(openId, {

        first: {
          value: '第三期集训营报名提醒',
          color: ''
        },
        keyword1: {
          value: ret.userInfo.nickname,
          color: ''
        },
        keyword2: {
          value: moment().format('YYYY年M月Do'),
          color: ''
        },

        remark: {
          value: '点击详情。添加集训营营长Iris的微信吧, 她会邀请你加入集训营专属群~',
          color: ''
        }
      }, {
        templateId: templateId,
        url: newsUrl
      }, _cb);
    },
  }, _u.delayRun(cb));
}

