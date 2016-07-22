'use strict';

var _u = require('../common/util');
var config = require('config');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var validateJwt = expressJwt({secret: config.secrets.session});

const User = _u.model('User');
const AppErr = require('../common/AppErr');
const redisService = _u.service('redis');
const logger = _u.logger;
const loggerD = _u.loggerD;

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 401
 */
function isAuthenticated() {
  return compose()
    .use(function (req, res, next) {
      if (req.cookies && Object.prototype.hasOwnProperty.call(req.cookies, 'token')) {
        req.headers.authorization = 'Bearer ' + req.cookies.token.replace(/"/g, '');
      }

      //验证 req.headers.authorization
      validateJwt(req, res, next);
    })
    .use(function (req, res, next) {
      _u.mySeries({
        checkRedisToken: (_cb) => {
          let token = req.headers.authorization.substr(7);//去掉前缀'Bearer '
          redisService.checkUserAccessToken(req.user._id, token, _cb);
        },
        user: (_cb) => {
          User.findById(req.user._id, _cb);
        },
      }, (err, ret) => {
        if (err) return next(err);
        if (!ret.user) {
          return next(new AppErr('noUserForThisToken'));
        }

        req.user = ret.user;
        loggerD.write('userAuth', req.user._id, req.user.mobile);
        next();
      });
    });
}

function checkToken() {
  return function(req, res, next) {
    if (!req.headers.authorization) return next();

    var token = req.headers.authorization.replace(/Bearer /g, '');
    _u.mySeries({
      verifiedUser: function(_cb) {
        jwt.verify(token, config.secrets.session, _cb);
      },
      user: function(_cb, ret) {
        if (!ret.verifiedUser) return _cb();
        User.findById(ret.verifiedUser._id, _cb);
      },
    }, function(err, ret) {
      if (err) return next(err);
      req.user = ret.user;
      next();
    });
  }
}
exports.checkToken = checkToken;

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    });
}

function hasValidLevel(levelRequired) {
  if (!levelRequired) throw new Error('Required level needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function (req, res, next) {
      if (_u.isValid(req.user.validAt) && req.user.level >= levelRequired) {
        return next();
      }
      next(new AppErr('illegalLevel', 403, {
        levelRequired, level: req.user.level, validAt: req.user.validAt
      }));
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
//  return jwt.sign({_id: id}, config.secrets.session, {expiresIn: 60 * 60 * 5});
  return jwt.sign({_id: id}, config.secrets.session);//不设置过期时间，token永久有效
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.hasValidLevel = hasValidLevel;
