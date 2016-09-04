'use strict';

const _u = require('./common/util');
const weixin = require('./common/weixin');
const userService = _u.service('user');
const redisService = _u.service('redis');



let token = 'FABTt5KzeleYxnMjP8bdpRDGZKIwV-9oiNqxIuKLO09SYxGG_hpfE-oHPQblZI33GJ2eeM3TPROVTN_C28l8oigFvFIAlAxkd3UukDDu6HwMBRhAIAETJ';
let openid = 'oSB10wzOr2wcSSjuzcCqbakzZKuo';
let path = './1.png'
let msgBody = {
    "touser": openid,
    "msgtype":"image",
    "image":
    {
      "media_id": '2-08LdGCmIvJ8qoumRWEb8XQcPZhkrXtO-dtC0HYvDjtKPJ1OcQBUUp15XX-9b7b'
    }
}

userService.updateMediaIdForUser(openid, function () {
	console.log(arguments)
})
// weixin.sendScoreMessage(openid);
// weixin.sendCustomerMsg(msgBody, function () {
// 	console.log(arguments)
// })
// weixin.uploadImg(token, path, function () {
// 	console.log(arguments)
// })
// let message = { ToUserName: 'gh_690b6500ec3d',
//   FromUserName: 'oSB10w52vUxOabF1FAPB13uyne8g',
//   CreateTime: '1470127920',
//   MsgType: 'event',
//   Event: 'subscribe',
//   EventKey: 'qrscene_oSB10w52vUxOabF1FAPB13uyne8g',
//   Ticket: 'gQE58DoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL3dUaHBCTnZtSy1OU0pjcjlYeFNNAAIEUxSfVwMEAAAAAA==' };

// let openid = 'oSB10w52vUxOabF1FAPB13uyne8g';
// let token = 'BYggHkXlwme-2ftk7tspnfylZgFRBQwphGlFqylfqL0KSIpxpIll_3646wekWKPCQ7BkpBAtPudS-f7wz5ObEUOiPc4ue4vO97uv4HrfYweNud8bsjSbJ5rpl4g7NxJqGFHfAGAJIK';


// weixin.getUserInfo(token, openid, console.log);
//let inviter = message.EventKey.substr(message.EventKey.indexOf('_') + 1);
//let inviter = message.EventKey.replace(/^qrscene_/, '');
//userService.processInvitation(inviter, message.FromUserName, console.log);
//redisService.saddInvitee(inviter, message.FromUserName, console.log);

//userService.processSubscribe(openid, console.log);

//_u.mySeries({
//  token: (_cb) => {
//    weixin.getAccessToken(_cb);
//  },
//  upload: (_cb, ret) => {
//    weixin.uploadImg(ret.token, './static/2.png', _cb);
//  },
//}, (err, ret) => {
//  console.log(err, ret);
//});

/*
 *    { media_id: 'tiHx0iQpjT8pQvX6QhOEF343pSecsXKeBRFmdGGyUfM',
 *      url: 'http://mmbiz.qpic.cn/mmbiz/pmAb5mic4qYykNCvc6ibibUkFUIJHsKEcrb3szqNJJLsujHg5Nh3wFfuU7PrdWBNSTRV0sfFObLzEic0lBZiajBVxOA/0?wx_fmt=jpeg' } }
 */
