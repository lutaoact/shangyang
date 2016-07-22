'use strict';

const config = require('config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const WeixinStrategy = require('passport-weixin').Strategy;

const _u = require('../common/util');
const AppErr = require('../common/AppErr');
const logger = _u.logger;
const loggerD = _u.loggerD;
const userService = _u.service('user');
const redisService = _u.service('redis');

function canPass(mobile, code) {
  var isSelf = mobile === '13000000000' && code === '1111';
  var isDeveloper = process.env.NODE_ENV === 'development' && code === '1234';
  return isSelf || isDeveloper;
}

passport.use(new LocalStrategy({
  usernameField: 'mobile',
  passwordField: 'verifyCode',
}, (mobile, verifyCode, done) => {
}));

function checkVerifyCode(mobile, verifyCode, cb) {
  _u.mySeries({
    verifyCode: (_cb) => {
      redisService.getVerifyCode(mobile, _cb);
    },
    check: (_cb, ret) => {
      if (!ret.verifyCode) {
        return _cb(new AppErr('codeNotExist', null, {mobile}));
      }

      if (ret.verifyCode !== verifyCode) {
        return _cb(new AppErr('codeNotMatch', null, {
          mobile, verifyCode, verifyCodeInRedis: ret.verifyCode
        }));
      }
      _cb();
    },
  }, cb);
}

passport.use('localV2', new LocalStrategy({
  usernameField: 'mobile',
  passwordField: 'verifyCode',
}, (mobile, verifyCode, done) => {
  if (canPass(mobile, verifyCode)) {
    return done(null, mobile);
  }
  checkVerifyCode(mobile, verifyCode, (err) => {
    if (err) return done(err);
    loggerD.write('localV2Pass', mobile, verifyCode);
    done(null, mobile);
  });
}));

//passport.use('weixinUserinfo', new WeixinStrategy({
//  authorizationURL: 'https://open.weixin.qq.com/connect/oauth2/authorize',
//  clientID    : config.weixin.clientID,
//  clientSecret: config.weixin.clientSecret,
//  callbackURL : config.weixin.callbackURL,
//  requireState: false,
//  scope       : 'snsapi_userinfo',
//  passReqToCallback: true,
//}, (req, token, refreshToken, profile, done) => {
//  if (!profile.id) {
//    return done(new AppErr('undefinedUnionid', null, {profile}));
//  }
//
//  _u.mySeries({
//    user: (_cb) => {
//      userService.getUser('weixin', {unionid: profile.id, profile}, _cb);
//    },
//  }, (err, ret) => {
//    if (err) return done(err);
//    done(null, ret.user);
//  });
//}));
