'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');
const _u = require('../common/util');

let schema = new Schema({
  openid: {
    $type: String,
    unique: true,
    required: true,
  },
  ticket: String,//用来换取二维码
  mediaId: String,//上传之后的素材id
  url: String,//素材的链接地址
  disabled: {
    $type: Boolean,
  },
}, {collection: 'user', timestamps: true, typeKey: '$type'});

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', schema);
