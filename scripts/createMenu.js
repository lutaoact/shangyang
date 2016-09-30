'use strict';

const weixin = require('../common/weixin');

let menu = {
  button: [{
    name: '学习方法',
    type: 'view',
    url: 'http://mp.weixin.qq.com/mp/homepage?__biz=MjM5MTAwNTA4MA==&hid=1&sn=9a93f7ad954160a98ceb4ad177cfc99b#wechat_redirect',
  }, {
    name: '集训营',
    type: 'view',
    url: 'http://mp.weixin.qq.com/s?__biz=MzAxMDgwNDk0Nw==&mid=100000016&idx=1&sn=ee32c334e1ba7af3efc710b190a92aae&scene=20#rd',
  }]
};
weixin.createMenuWithToken(menu, console.log);
