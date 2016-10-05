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
  {"id": "o0zx1s7olJt6ySARtQmWrFLGax4U"},
  {"id": "o0zx1s11EDNlA9OszlqE4cLdS4l8"},
  {"id": "o0zx1s1wSJodNxuZlb0l0Obq9V4A"},
  {"id": "o0zx1s75p_RV3-ItKytF4RK0MiFE"},
  {"id": "o0zx1s6c1igZ890dvSRDDiNUIHcg"},
  {"id": "o0zx1s6AhIrYeaxWntXxtjXY0anI"},
  {"id": "o0zx1swgnMGGUpKTusHuHtzKyXoc"},
  {"id": "o0zx1s84JfhzoRxRcY4yPHoawjn8"},
  {"id": "o0zx1s4Vcetl6wmxoDY-zqoFW21w"},
  {"id": "o0zx1s7Qu3PCfzAm-g83Uc4WvoOY"},
  {"id": "o0zx1sxJTVtE0Dc3ymxKDP3Sc1zg"},
  {"id": "o0zx1s6voUldaJeLOaXzQ9YC_UMs"},
  {"id": "o0zx1s-JKpu5Cc1VYoDBHWKbo67s"},
  {"id": "o0zx1sx_rYW6lnogstc1OoB3wK1w"},
  {"id": "o0zx1s0mH4SBgXxfYd29xkhgjxT8"},
  {"id": "o0zx1s5a8JRymY76qnfbK23MxmOs"},
  {"id": "o0zx1sxXUh_bbkmOT46aXDzuxcuI"},
  {"id": "o0zx1s6Jyg7uR2QXYlB0AbQvaU2Q"},
  {"id": "o0zx1syKzlgUKh34grllBy6ZkHcc"},
  {"id": "o0zx1sxpWoJwZeTlGwzBeVvpcBNg"},
  {"id": "o0zx1s9VkoIk4YoTxnr3VOLYyuUc"},
  {"id": "o0zx1s_BBc7aF9uM5OTDvnZJupeI"},
  {"id": "o0zx1swqwcOzZOwTur5tQBtnmx-c"},
  {"id": "o0zx1s__ELNLOIVWLm_JyuRAOIEI"},
  {"id": "o0zx1s0gQv8Hva5D8VcskwRzcOkI"},
  {"id": "o0zx1s3LCRIMAIDBX755zv4R3D3Y"},
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
      // loggerD.write('[Send Message]', "Term 2 Message openId" , openId, 'rank', rank);
      // weixin.sendMsgToQualifiedInviter(openId, rank, _cb);
    },
  }, _u.delayRun(cb));
}

