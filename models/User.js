'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');
const _u = require('../common/util');

//手机号和微信unionid都可能为空，但都唯一，都应该建立唯一索引
let schema = new Schema({
  mobile: {
    $type: String,
    unique: true,
    sparse: true,
    validate: /\d{11}/,
  },
  unionid: {
    $type: String,
    unique: true,
    sparse: true,
  },
  nickname: String,
  profileImg: String,
  weixinProfile: {},
  level: {//等级
    $type: Number,
    default: 0,
  },
  validAt: Date,
  alarmDisabled: {
    $type: Boolean,
    default: false,
  },
  recentClient: String,
  invitationCode: {
    $type: String,
    unique: true,
    sparse: true,
  },
}, {collection: 'user', timestamps: true, typeKey: '$type'});

schema.virtual('isValid')
  .get(function() {
    return _u.isValid(this.validAt);
  });

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', schema);
