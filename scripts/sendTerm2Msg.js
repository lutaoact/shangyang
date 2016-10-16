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

const openIds = [
{"id": "o0zx1s7gMqY9MSfcpXZDRUyhqWkU"},
{"id": "o0zx1s_knfht-4jFkOmYHg3uHTgc"},
{"id": "o0zx1s9JiPDdh0WN4ht2gsCfJzjo"},
{"id": "o0zx1s_TmxrQz0kbPjcX5z-SFfpw"},
{"id": "o0zx1s0ND_JUEj8CDYOafTlwbffE"},
{"id": "o0zx1s4fiSJe4EPoPuHvztWeFU1Q"},
{"id": "o0zx1s4RLOBnFqQiPTYB7uraIalc"},
{"id": "o0zx1s0o0qzRicTizLbZZLy3ISEg"},
{"id": "o0zx1syPmVegAixGStjgRLDtrsRI"},
{"id": "o0zx1s8IYi3_kuEaYD56hJW1MmAQ"},
{"id": "o0zx1s2EW76-h9Zot0m5VVAFpXMg"},
{"id": "o0zx1s2Hs_lC9ZFCZk7q_NxdOwFU"},
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
    sendMsg: (_cb, ret) => {
      console.log(ret.rank);
      loggerD.write('[Send Message]', "Term 3 Message openId" , openId, 'rank', ret.rank);
      // weixin.sendMsgToQualifiedInviter(openId, ret.rank, _cb);
      // weixin.sendImage(openId, `./groupQrCode/term2.jpg`, _cb);
      let msg = '恭喜您获得免费参加第三期集训营的资格. 快快扫描上边二维码, 添加集训营营长Iris的微信吧, 她会邀请你加入集训营专属群~',
      let msgBody = {
        touser: openId, msgtype: "text",
        text: { content: msg }
      };
      sendCustomerMsgWithToken(msgBody, _cb);
    },
  }, _u.delayRun(cb));
}

