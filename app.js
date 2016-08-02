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

const wechatConfig = {
  token: 'weixin',
  appid: process.env.APPID,
  encodingAESKey: 'wmYBjHcEYQmRC0aPMJ556u5oAdpYD5NIlPMijX72hKY'
};
app.use('/wechat', wechat(wechatConfig, (req, res, next) => {
  let message = req.weixin;
  console.log(message);
  res.reply({
    type: "image",
    content: {mediaId: 'tiHx0iQpjT8pQvX6QhOEF343pSecsXKeBRFmdGGyUfM'}
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
