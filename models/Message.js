'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
  content: {
  },
}, {collection: 'message', timestamps: true, typeKey: '$type'});

module.exports = mongoose.model('Message', schema);
