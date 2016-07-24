// 暂时放于routes下  之后需要将weixin单独抽象在common里
// 

'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../auth/auth.service');

const http = require('http');
const fs = require('fs');
const https = require('https');
const querystring = require('querystring');

const wechat = require('wechat');

const ImageComposer = require('../common/ImageComposer/')
const Promise = require('bluebird');

const responsePrototype = http.ServerResponse.prototype;
responsePrototype.payload = function(payload) {
//	this.json({message: 'ok', timestamp: Date.now(), payload});
};

const APPID = 'wx8b20d81c2353e8cd';
const APPSECRET = 'c89b14a7745377a910a1ad6df4924cfa';
const BASEURL = '/cgi-bin/';
const HOST = 'api.weixin.qq.com';

const OPTIONS = {
	hostname: HOST,
	port: 443,
	method: 'GET',
	headers: {
		// 'Content-Type': 'application/x-www-form-urlencoded'
	}
};

const _request = (options) => {

	console.log(options)
	let data = '';
	return new Promise((resolve, reject) => {
		const req = https.request({
			hostname: options && options.host || HOST,
			port: 443,
			method: options && options.method || 'GET',
			path: options.path,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, (res) => {
			res.setEncoding((options && options.encoding || 'utf-8'));
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				if (options && options.responseType === 'BUFFER') {
					resolve(data);

				}
				else {
					resolve(JSON.parse(data));
				}
			});
		});

		req.on('error', (e) => {
		 	console.log(`problem with request: ${e.message}`);
			reject(e);
		});

		if (options && options.postData) {
			req.end(JSON.stringify(options.postData));
		}
		req.end();
	});
};

// TODO: 存入redis

const _getAccessToken = () => {

	return _request({path: '/cgi-bin/token?grant_type=client_credential&appid=' 
					+ APPID + '&secret=' + APPSECRET});
};

router.get('/getToken', (req, res, next) => {

	_getAccessToken().then((data) => res.end(data.access_token.toString()));

});


router.get('/getQRCode', (req, res, next) => {

	// https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
	_getAccessToken().then((data) => {

		return _request({path: '/cgi-bin/qrcode/create?access_token=' + data.access_token, 
			method: 'POST',
			postData: {
				expire_seconds: 604800, 
				action_name: 'QR_LIMIT_SCENE', 
				action_info: {
					scene: {
						scene_id: 123
					}
				}
			}});
	}).then((data) => {

		return _request({
			path: '/cgi-bin/showqrcode?ticket=' + encodeURIComponent(data.ticket),
			host: 'mp.weixin.qq.com',
			responseType: 'BUFFER',
			encoding: 'binary'
		})

	}).then((data) => {
		return new Promise((resolve, reject) => {
			const imageSrc = __dirname + '/1.png';

			fs.writeFile(imageSrc, data, 'binary', function (err) {
				if (err) reject(err);
				resolve(imageSrc);
			});
		});
	}).then((imageSrc) => {

		const imgComposer = new ImageComposer();

		return new Promise((resolve, reject) => {
			imgComposer.compose({
				// backgroundSrc: __dirname + '/background.jpg', 
				// qrcodeSrc: __dirname + '/qrcode.jpg',
				qrcodeSrc: imageSrc,
				outputPath: __dirname + '/outputName.png'
			}, function (err) {
				if (err) reject(err);
				resolve();
			});
		})
	}).then(() => {
		res.end('success')
	});
	
});

var config = {
  token: 'weixin',
  appid: APPID,
  encodingAESKey: 'wmYBjHcEYQmRC0aPMJ556u5oAdpYD5NIlPMijX72hKY'
};


router.get('/', wechat(config, (req, res, next) => {

	// 用于微信接口验证
	if (req.query && req.query.echostr) {
		res.end(req.query.echostr);
	}

	// 微信输入信息都在req.weixin上
	var message = req.weixin;
    res.reply('hehe');
}));

module.exports = router;
