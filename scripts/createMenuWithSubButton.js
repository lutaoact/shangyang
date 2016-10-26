'use strict';

const weixin = require('../common/weixin');

let menu = {
  button: [{
    name: '方法',
    type: 'view',
    url: 'http://mp.weixin.qq.com/mp/homepage?__biz=MjM5MTAwNTA4MA==&hid=1&sn=9a93f7ad954160a98ceb4ad177cfc99b#wechat_redirect',
  }, {
    name: 'App',
    type: 'view',
    url: 'http://learnwithwind.com/',
  }, {
    name: '课程',
    sub_button: [{
      name: 'Wind小传',
      type: 'view',
      url: 'http://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000073&idx=1&sn=762a1b0927ff43770b004d17289f758a&chksm=1b4b8af52c3c03e3a7080de0e4a32283dd7f3f3448a5bb98d501c08bb5df285d32df041a4bd0#wechat_redirect',
    }, {
      name: '付费课程',
      type: 'view',
      url: 'http://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000075&idx=1&sn=98d48682a58a0ed2ffc0f939785f63e3&chksm=1b4b8af72c3c03e1ff091ebd1468d796119fcef55d46697afd6d0eea4ffe59ea8122cee63941&scene=0#wechat_redirect',
    }],
  }]
};
weixin.createMenuWithToken(menu, console.log);
