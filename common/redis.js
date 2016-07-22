'use strict';

const redis = require('redis');
const config = require('config');
const _ = require('lodash');

_.each(config.redis, (dbConfig, dbname) => {
  let client = redis.createClient(dbConfig);
  client.on('error', (err) => {
    console.log(`redis connect error: ${dbname}`, err);
  });
  client.on('ready', (err) => {
    console.log(`redis client ready: ${dbname}`);
  });
  //文档中说，支持path中指定db：redis://localhost:6379/1
  //但实际上并不支持，issue中提到，会在v2.5之后支持，暂时还是得用select
  client.select(dbConfig.db);
  exports[dbname] = client;
});
