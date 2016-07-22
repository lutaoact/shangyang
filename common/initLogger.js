'use strict';

const config = require('config');
const log4js = require('log4js');
const moment = require('moment');

log4js.configure({
  appenders: [{
    type: 'console'
  }, {
    type: 'dateFile' ,
    filename: config.logger.path,
    pattern: ".yyyyMMdd",
    alwaysIncludePattern: false,
    category: 'APP',
  }, {
    type: 'dateFile',
    filename: config.logger.dataPath,
    pattern: ".yyyyMM",
    alwaysIncludePattern: false,
    layout: {
      type: 'pattern',
      pattern: "%m",
    },
    category: 'DATA',
  }, {
    type: 'file',
    filename: config.logger.eLog,
    category: 'ELOG',
  }]
});

const logger = log4js.getLogger('APP');
logger.setLevel(config.logger.level);

const write = function() {
  if (typeof arguments[0] === 'object') {
    arguments[0] = JSON.stringify(arguments[0]);
  }
  Array.prototype.unshift.call(arguments, moment().format());
  this.info(Array.prototype.join.call(arguments, " "));
};

const loggerD = log4js.getLogger('DATA');
loggerD.setLevel('INFO');
loggerD.write = write

const eLogger = log4js.getLogger('ELOG');
eLogger.setLevel('ERROR');

exports.logger  = logger;
exports.loggerD = loggerD;

exports.eLog = function() {
  let params = Array.prototype.slice.call(arguments, 0);
  eLogger.error.apply(eLogger, params);
};
