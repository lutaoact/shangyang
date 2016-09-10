'use strict';

const _u = require('./common/util');
const weixin = require('./common/weixin');
const userService = _u.service('user');
const redisService = _u.service('redis');



let token = '55o7tv65xEzXxsG0JXnv9BRjYuRExMantdQIEwfCPI0VtFGid03MojC2IPyMKd-uAKxod6ZbZa3CrnhrZeFMq94tXi_SIW7H4aQXTx_j7TtvCbpB7aP2hNVy-aPzhVKnEQIeABANZR';
let openid = 'oSB10wzOr2wcSSjuzcCqbakzZKuo';
let path = './1.png'
let msgBody = {
  touser: openid,
  msgtype: 'news',
  news: {
    articles: [{
      title: 'Happy Day',
      description: 'Is Really A Happy Day',
      url: 'http://mp.weixin.qq.com/s?__biz=MzAwODE4Nzk2Ng==&tempkey=DtfGz%2F5m1gHUHll6Qr7RvUoW%2BqLgSnD3IVVSgY1vNfRRZl0VBBYfetjFaw1KqBzyWjJ60fgk9U0YL%2BM2rzfcR%2F%2BjhBgmTqoWcpcjzjf2%2FHOhnirfqr4d%2B%2FMeG%2BMwwVmlz8oJvnyk1WY83sI1gYHv2g%3D%3D&#rd',
      picurl: 'http://mmbiz.qpic.cn/mmbiz/hb0fNLLZtnNSzqJelT9KgPnybh1LFCClicyzYxEIER6fCllSq8ZZevkL1cUKpTqoVD9MbeEDdKe2c5z7ceshG9g/640?wx_fmt=jpeg&tp=webp&wxfrom=5'
    }, {
      title: 'Happy Day',
      description: 'Is Really A Happy Day',
      url: 'http://mp.weixin.qq.com/s?__biz=MzAwODE4Nzk2Ng==&tempkey=DtfGz%2F5m1gHUHll6Qr7RvUoW%2BqLgSnD3IVVSgY1vNfRRZl0VBBYfetjFaw1KqBzyWjJ60fgk9U0YL%2BM2rzfcR%2F%2BjhBgmTqoWcpcjzjf2%2FHOhnirfqr4d%2B%2FMeG%2BMwwVmlz8oJvnyk1WY83sI1gYHv2g%3D%3D&#rd',
      picurl: 'http://mmbiz.qpic.cn/mmbiz/hb0fNLLZtnNSzqJelT9KgPnybh1LFCClicyzYxEIER6fCllSq8ZZevkL1cUKpTqoVD9MbeEDdKe2c5z7ceshG9g/640?wx_fmt=jpeg&tp=webp&wxfrom=5'
    }]
  }
};

// let msgBody = {
//     "touser": openid,
//     "msgtype": "text",
//     "text": {
//       "content":"Hello World"
//     }
//   };

weixin.sendScoreMessage(openid);

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

// userService.processSubscribe(openid, console.log);

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
