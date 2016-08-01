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
  disabled: {
    $type: Boolean,
  },
}, {collection: 'user', timestamps: true, typeKey: '$type'});

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', schema);
