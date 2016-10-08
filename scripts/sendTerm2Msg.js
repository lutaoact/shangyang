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
  // {"id": "o0zx1syKzlgUKh34grllBy6ZkHcc"},
  // {"id": "o0zx1sxpWoJwZeTlGwzBeVvpcBNg"},
  // {"id": "o0zx1s9VkoIk4YoTxnr3VOLYyuUc"},
  // {"id": "o0zx1s_BBc7aF9uM5OTDvnZJupeI"},
  // {"id": "o0zx1swqwcOzZOwTur5tQBtnmx-c"},
  // {"id": "o0zx1s__ELNLOIVWLm_JyuRAOIEI"},
  // {"id": "o0zx1s0gQv8Hva5D8VcskwRzcOkI"},
  // {"id": "o0zx1s3LCRIMAIDBX755zv4R3D3Y"},
{"id":"o0zx1sxqDA-nkvz9_wr-PxxcqXuU"}
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
      loggerD.write('[Send Message]', "Term 2 Message openId" , openId, 'rank', ret.rank);
      weixin.sendMsgToQualifiedInviter(openId, ret.rank, _cb);
    },
  }, _u.delayRun(cb));
}

