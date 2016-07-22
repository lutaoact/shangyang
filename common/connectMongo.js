'use strict';

const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(config.mongo.uri);

mongoose.connection.on('error', function () {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});
mongoose.connection.once('open', function() {
  console.log('open mongodb success');
});
