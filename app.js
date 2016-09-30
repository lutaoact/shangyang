'use strict';

const express = require('express');
const cors = require('cors');
const config = require('config');
const wechat = require('wechat');
const morgan = require('morgan');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const FileStreamRotator = require('file-stream-rotator');

const _u = require('./common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;
const AppErr = require('./common/AppErr');

console.log(config);

const app = express();

const accessLog = FileStreamRotator.getStream(config.logging.accessLog);
const errorLog = fs.createWriteStream(config.logging.errorLog, {flags: 'a'});

morgan.format('app', config.logging.format);
app.use(morgan('app', {stream: accessLog}));
app.use(morgan('dev'));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use((req, res, next) => {
  let agent = req.headers['x-sg-agent'];
  let headers = req.headers;
  logger.info({url: req.originalUrl, query: req.query, body: req.body, agent, headers});

  if (agent) {
    let splits = agent.split('/');
    req.clientType = splits[0].toLowerCase();
    req.clientVersion = splits[1];
  }

  let perPage = +req.query.perPage || config.pageInfo.perPage;
  let page = +req.query.page || 1;
  req.pageInfo = {perPage, page};
  req.pageForMongo = {
    skip: (page - 1) * perPage,
    limit: perPage,
  };

  res.page = (totalNum, payload) => {
    let pageInfo = {page, perPage, totalNum};
    res.json({message: 'ok', pageInfo, payload});
  };
  next();
});

app.use('/', require('./routes/'));
app.use('/auth', require('./auth'));
app.use('/users', require('./routes/user'));

app.use('/weixin', require('./routes/weixin'));
app.use('/api', require('./routes/api'));

// process.env.APPID =
const wechatConfig = {
  token: 'weixin',
  appid: process.env.APPID,
  // encodingAESKey: 'wmYBjHcEYQmRC0aPMJ556u5oAdpYD5NIlPMijX72hKY'
  encodingAESKey: 'J64fqLqWiiWc11gybKlMsJjoFox6euM4j1wsbhcGBC9'
};

const userService = _u.service('user');
const redisService = _u.service('redis');
const Message = _u.model('Message');
const User = _u.model('User');

app.use('/wechat', wechat(wechatConfig, (req, res, next) => {
  let message = req.weixin;
  Message.create({content: message}, console.log);//所有的消息都存一份，备用

  let openid = message.FromUserName;

  redisService.addLatestAccess(openid, console.log);//最新访问时间

  //暂时只处理subscribe事件，后续可以再丰富
  if (message.Event !== 'subscribe') {
    // 非订阅消息
    loggerD.write('[Recv] Welcome:', '[From]', openid);
    loggerD.write('[Send] Welcome Reply:', '[To]', openid);
    return res.reply('欢迎再次回来');
  }

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
      if (!ret.user.isNewCreated) {
        loggerD.write('[Recv] Old User Subscribe:', '[From]', openid);
        return _cb();
      }

      loggerD.write('invitation', inviterIncrId, ret.user.incrId, openid);
      loggerD.write('[Recv] Invitation Subscribe:', '[From]', openid, '[InviterIncrId]', inviterIncrId);
      userService.processInvitation(ret.inviterUser, openid, _cb);
    },
  }, (err, ret) => {
    if (err) {
      logger.error(err);
    }
    res.reply('');
  });
}));

const util = require('util');
app.use((err, req, res, next) => {
  let meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  logger.error(err, JSON.stringify(err.more));
  if (!err.status) {
    err = new AppErr('systemError', 500, {err: util.inspect(err)});
  }
  res.status(err.status).json(err);
});

app.listen(config.port);
