'use strict';

const express = require('express');
const router = express.Router();
const _u = require('../common/util');
const loggerD = _u.loggerD;
const userService = _u.service('user');
const auth = require('./auth.service');
const redisService = _u.service('redis');
const User = _u.model('User');

const passport = require('passport');
require('./configure_passport');

function generateToken(uid, cb) {
  _u.mySeries({
    token: (_cb, ret) => {
      _cb(null, auth.signToken(uid));
    },
    saveToRedis: (_cb, ret) => {
      redisService.setUserAccessToken(uid, ret.token, _cb);
    },
  }, (err, ret) => {
    cb(err, ret.token);
  });
}

function authenticateFunc(strategyKey) {
  return function(req, res, next) {
    passport.authenticate(strategyKey, (err, mobile) => {
      if (err) return next(err);
      let recentClient = req.clientType;
      _u.mySeries({
        user: (_cb) => {
          userService.getUser('mobile', {mobile, recentClient}, _cb);
        },
        giveInvitationReward: (_cb, ret) => {
          if (!ret.user.isNewCreated) return _cb();
          if (!req.body.invitationCode) return _cb();
          let invitationCode = req.body.invitationCode;
          userService.giveInvitationReward(ret.user, invitationCode, _cb);
        },
        token: (_cb, ret) => {
          generateToken(ret.user._id, _cb);
        },
      }, (err, ret) => {
        if (err) return next(err);
        loggerD.write('smsLogin', mobile, ret.user._id);
        ret.user.token = ret.token;
        res.payload(ret.user);
      });
    })(req, res, next);
  };
}

router.post('/smsLogin', (req, res, next) => {
  authenticateFunc('local')(req, res, next);
});

router.post('/smsLogin/v2', (req, res, next) => {
  authenticateFunc('localV2')(req, res, next);
});

router.get('/weixinLogin', (req, res, next) => {
  passport.authenticate('weixinUserinfo', (err, user) => {
    if (err) return next(err);
    _u.mySeries({
      token: (_cb, ret) => {
        generateToken(user._id, _cb);
      },
    }, (err, ret) => {
      if (err) return next(err);
      loggerD.write({type: 'weixinLogin', uid: user._id});
      if (req.query.index === 'favorStock') {
        res.redirect(`/stocks/favorite?token=${ret.token}`);
      } else {
        res.redirect(`/?token=${ret.token}`);
      }
    });
  })(req, res, next);
});

module.exports = router;
