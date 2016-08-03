'use strict';

const _u = require('./common/util');
const weixin = require('./common/weixin');
const userService = _u.service('user');

let openid = 'oSB10w52vUxOabF1FAPB13uyne8g';
userService.processSubscribe(openid, console.log);

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
