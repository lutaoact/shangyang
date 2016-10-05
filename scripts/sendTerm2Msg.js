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

const openId = [
  "o0zx1s7olJt6ySARtQmWrFLGax4U",
  "o0zx1s11EDNlA9OszlqE4cLdS4l8",
  "o0zx1s1wSJodNxuZlb0l0Obq9V4A",
  "o0zx1s75p_RV3-ItKytF4RK0MiFE",
  "o0zx1s6c1igZ890dvSRDDiNUIHcg",
  "o0zx1s6AhIrYeaxWntXxtjXY0anI",
  "o0zx1swgnMGGUpKTusHuHtzKyXoc",
  "o0zx1s84JfhzoRxRcY4yPHoawjn8",
  "o0zx1s4Vcetl6wmxoDY-zqoFW21w",
  "o0zx1s7Qu3PCfzAm-g83Uc4WvoOY",
  "o0zx1sxJTVtE0Dc3ymxKDP3Sc1zg",
  "o0zx1s6voUldaJeLOaXzQ9YC_UMs",
  "o0zx1s-JKpu5Cc1VYoDBHWKbo67s",
  "o0zx1sx_rYW6lnogstc1OoB3wK1w",
  "o0zx1s0mH4SBgXxfYd29xkhgjxT8",
  "o0zx1s5a8JRymY76qnfbK23MxmOs",
  "o0zx1sxXUh_bbkmOT46aXDzuxcuI",
  "o0zx1s6Jyg7uR2QXYlB0AbQvaU2Q",
  "o0zx1syKzlgUKh34grllBy6ZkHcc",
  "o0zx1sxpWoJwZeTlGwzBeVvpcBNg",
  "o0zx1s9VkoIk4YoTxnr3VOLYyuUc",
  "o0zx1s_BBc7aF9uM5OTDvnZJupeI",
  "o0zx1swqwcOzZOwTur5tQBtnmx-c",
  "o0zx1s__ELNLOIVWLm_JyuRAOIEI",
  "o0zx1s0gQv8Hva5D8VcskwRzcOkI",
  "o0zx1s3LCRIMAIDBX755zv4R3D3Y",
];



async.eachSeries(openId, sendMsg, console.log);


function sendMsg(openId, cb) {
  console.log('openId:', openId);
  // let rank = 70;
  _u.mySeries({
    rank: (_cb) => {
      redisService.getQualifiedRank(openId, _cb);

    },
    sendMsg: (_cb, ret) => {
      console.log(ret.rank);
      // loggerD.write('[Send Message]', "Term 2 Message openId" , openId, 'rank', rank);
      // weixin.sendMsgToQualifiedInviter(openId, rank, _cb);
    },
  }, _u.delayRun(cb));
}

