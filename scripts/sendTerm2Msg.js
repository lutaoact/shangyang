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
<<<<<<< HEAD
  // {"id": "o0zx1syKzlgUKh34grllBy6ZkHcc"},
  // {"id": "o0zx1sxpWoJwZeTlGwzBeVvpcBNg"},
  // {"id": "o0zx1s9VkoIk4YoTxnr3VOLYyuUc"},
  // {"id": "o0zx1s_BBc7aF9uM5OTDvnZJupeI"},
  // {"id": "o0zx1swqwcOzZOwTur5tQBtnmx-c"},
  // {"id": "o0zx1s__ELNLOIVWLm_JyuRAOIEI"},
  // {"id": "o0zx1s0gQv8Hva5D8VcskwRzcOkI"},
  // {"id": "o0zx1s3LCRIMAIDBX755zv4R3D3Y"},
  // {"id":"o0zx1sxqDA-nkvz9_wr-PxxcqXuU"}
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
      weixin.sendImage(openid, `./groupQrCode/term2.jpg`, _cb);
    },
  }, _u.delayRun(cb));
}

