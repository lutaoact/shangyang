'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const http = require('http');
const responsePrototype = http.ServerResponse.prototype;
responsePrototype.payload = function(payload) {
//	this.json({message: 'ok', timestamp: Date.now(), payload});
};

router.all('/', (req, res, next) => {
	res.end(req.query.echostr);
});

module.exports = router;
