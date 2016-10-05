'use strict';

const async = require('async');
const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('../common/AppErr');

const userService = _u.service('user');
const User = _u.model('User');

let messages = [
//  { "EventKey" : "", "FromUserName" : "o0zx1s2EHUGDVNMe3ob_p4I1Jdwo" },
//  { "EventKey" : "", "FromUserName" : "o0zx1sxq35Tv8dFShjrVMTaYBTig" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s4v_H4I2ChnzNrPZ3Jx_r0A" },
//  { "EventKey" : "qrscene_52", "FromUserName" : "o0zx1s6JUmwNgq7_eNDIkOL8dKek" },
//  { "EventKey" : "", "FromUserName" : "o0zx1sxO2dkw7_5hfOVUHTcgGBsA" },
//  { "EventKey" : "qrscene_52", "FromUserName" : "o0zx1s8oHPRWN4gcQPXtP8tGeAr8" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s9Inst4X_FoQWu6XhPyk7oU" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s9Kj7v6RzVUFnRk0m5wPuKE" },//问题
//  { "EventKey" : "", "FromUserName" : "o0zx1syKzlgUKh34grllBy6ZkHcc" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s1UXWZDq_natUv65DAcPI80" },
//  { "EventKey" : "", "FromUserName" : "o0zx1syj3CX9Ksi3_v6vwnn76eH8" },
//  { "EventKey" : "qrscene_6", "FromUserName" : "o0zx1s8Ms4CDjaq0MXDjSMJk-Zuk" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s5eitssg6yXAUz5i91_wDUY" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s3GgnIVSk4viIS8KTrDllZ4" },
//  { "EventKey" : "qrscene_52", "FromUserName" : "o0zx1sxIJucXW-RtQGeU3rQChroQ" },//问题
//  { "EventKey" : "qrscene_52", "FromUserName" : "o0zx1szw6nMhwRUA3R_8oYq2hNnA" },
//  { "EventKey" : "", "FromUserName" : "o0zx1s4fi3putkis9PPQd3_yCunE" },
//  { "EventKey" : "qrscene_14", "FromUserName" : "o0zx1s3tSGL0esTXmhmM8QyEfZ7Y" },
//  { "EventKey" : "qrscene_52", "FromUserName" : "o0zx1s1N3ArUT37n_fFrYvKTUhBg" },
//{ "EventKey" : "qrscene_298", "FromUserName" : "o0zx1syxzou1xOimlsTeFZQKE280" }
// { "EventKey" : "qrscene_70", "FromUserName" : "o0zx1s1ZNLWdkcObJRl2p3FdUqnk" }

//{ "EventKey" : "", "FromUserName" : "o0zx1sxpWoJwZeTlGwzBeVvpcBNg" }
//{ "EventKey" : "qrscene_376", "FromUserName" : "o0zx1s2zRUGKL5RpFD8SbwY-84qw" },
{ "EventKey" : "", "FromUserName" : "o0zx1sy9JU0D3VUSdRarxdAtOTVw" }


//

]
//messages = [
//  { "EventKey" : "", "FromUserName" : "o0zx1s6tzedzy_-9YbrBIXf7leQ8" },
//];

async.eachSeries(messages, processMessage, console.log);

function processMessage2(message, cb) {
  console.log(message);
  cb();
}

function processMessage(message, cb) {
  console.log('message:', message);
  let openid = message.FromUserName;
  let inviterIncrId = '';
  _u.mySeries({
    inviterUser: (_cb) => {
      //如果不是被人邀请进来的，那啥都不用做
      if (message.EventKey === '') {
        loggerD.write('[Recv] No Invitation Subscribe:', '[From]', openid);
        return _cb();
      }
      inviterIncrId = +message.EventKey.replace(/^qrscene_/, '');
      User.findOne({incrId: inviterIncrId}, _cb);
    },
    user: (_cb, ret) => {
      if (ret.inviterUser && ret.inviterUser.openid === openid) {//自己扫自己
        loggerD.write('[Recv] Self Subscribe:', '[From]', openid);
        return _cb(new AppErr('selfAction', null, {openid}));
      }
      if (ret.inviterUser === null) {
        loggerD.write('[Recv] inviterUser null:', inviterIncrId);
      }
      userService.processSubscribe(openid, ret.inviterUser, _cb);
    },
    invitation: (_cb, ret) => {
      //如果没有邀请者，那也就不需要添加邀请记录，直接完成
      if (!ret.inviterUser) {
        return _cb();
      }
      //如果不是新用户，似乎没啥好说的，啥都不做了吧
//      if (!ret.user.isNewCreated) {
//        loggerD.write('[Recv] Old User Subscribe:', '[From]', openid);
//        return _cb();
//      }

      loggerD.write('invitation', inviterIncrId, ret.user.incrId, openid);
      loggerD.write('[Recv] Invitation Subscribe:', '[From]', openid, '[InviterIncrId]', inviterIncrId);
      userService.processInvitation(ret.inviterUser, openid, _cb);
    },
  }, _u.delayRun(cb));
}
