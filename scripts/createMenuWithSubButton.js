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
      url: 'http://mp.weixin.qq.com/mp/homepage?__biz=MjM5MTAwNTA4MA==&hid=1&sn=9a93f7ad954160a98ceb4ad177cfc99b#wechat_redirect',
    }, {
      name: '付费课程',
      type: 'view',
      url: 'http://mp.weixin.qq.com/mp/homepage?__biz=MjM5MTAwNTA4MA==&hid=1&sn=9a93f7ad954160a98ceb4ad177cfc99b#wechat_redirect',
    }],
  }]
};
weixin.createMenuWithToken(menu, console.log);
