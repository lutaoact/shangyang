'use strict';

let util = require('util');

let msg = {
  paramsError: '参数错误',
  paramsMissing: '缺少参数',
  paramsLengthError: '参数长度错误',

  valueErr: '值错误',
  notFound: '未找到',
};

let AppErr = function(errcode, httpStatus, more) {
  Error.call(this, errcode);
  Error.captureStackTrace(this, this.constructor);
  this.message = errcode;
  this.status = httpStatus || 400;
  this.errtext = msg[errcode] || '抱歉，遇到未知错误，请重试';
  this.more = more;
};

util.inherits(AppErr, Error);

module.exports = AppErr;
