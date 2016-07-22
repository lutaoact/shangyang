'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const controller = require('../controllers/user');
module.exports = router;
