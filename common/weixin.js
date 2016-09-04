'use strict';

const fs = require('fs');
const request = require('request');

const ImageComposer = require('./ImageComposer/')
const _u = require('./util')

const cache = require('./cache');

const APPID     = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

const API_BASE = 'https://api.weixin.qq.com/cgi-bin';
const MP_BASE = 'https://mp.weixin.qq.com/cgi-bin';
const tokenUrl = `${API_BASE}/token`;
const createQrcodeUrl = `${API_BASE}/qrcode/create`;
const showQrcodeUrl = `${MP_BASE}/showqrcode`;
// 新增临时素材
const uploadMediaUrl = `${API_BASE}/media/upload`;

// const addMaterialUrl = `${API_BASE}/material/add_material`;
const userInfoUrl = `${API_BASE}/user/info`;
const templateMsgSendUrl = `${API_BASE}/message/template/send`;

function invokeWithToken(myFunc) {
  return function() {
    let args = Array.prototype.slice.call(arguments, 0);
    let cb = args.pop();

    _u.mySeries({
      token: (_cb) => {
        getAccessToken(_cb);
      },
      result: (_cb, ret) => {
        args.unshift(ret.token);
        args.push(_cb);
        myFunc.apply(null, args);
      },
    }, (err, ret) => {
      cb(err, ret.result);
    });
  };
}

// POST https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=ACCESS_TOKEN
// 文档 http://mp.weixin.qq.com/wiki/7/12a5a320ae96fecdf0e15cb06123de9f.html
//调用时不用传递token参数，因为invokeWithToken实现了这部分的内部逻辑
function sendCustomerMsg(token, msgBody, cb) {
  let url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`;
  request.post({url, json: true, body: msgBody}, (err, response, resBody) => {
    if (err) return _cb(err);
    cb(null, resBody);
  });
}
exports.sendCustomerMsg = invokeWithToken(sendCustomerMsg);
//weixin.sendCustomerMsg(msgBody, console.log);

// GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
function getAccessToken(cb) {
  let qs = {grant_type: 'client_credential', appid: APPID, secret: APPSECRET};
  cache.get('weixinAccessToken', (_cb) => {
    request.get({url: tokenUrl, qs, json: true}, (err, response, resBody) => {
      if (err) return _cb(err);
      _cb(null, resBody.access_token);
    });
  }, cb);
}
exports.getAccessToken = getAccessToken;

// GET https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
function getUserInfo(token, openid, cb) {
  let qs = {access_token: token, openid, lang: 'zh_CN'};
  request.get({url: userInfoUrl, qs, json: true}, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);
  });
}
exports.getUserInfo = getUserInfo;

// POST https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
function createQrcode(accessToken, openid, cb) {
  let options = {
    url: createQrcodeUrl, qs: {access_token: accessToken}, json: true,
    body: {
      action_name: 'QR_LIMIT_STR_SCENE',
      action_info: {scene: {scene_str: openid}},
    },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);//{"ticket":"xxxx","url":"yyyy"}
  });
}
exports.createQrcode = createQrcode;

// GET https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET
function showQrcode(ticket, openid, cb) {
  let url = `${showQrcodeUrl}?ticket=${encodeURIComponent(ticket)}`;
  let imageSrc = `./static/${openid}.png`;
  let stream = request(url)
    .on('error', (err) => {
      cb(err);
    })
    .pipe(fs.createWriteStream(imageSrc))
    .on('error', (err) => {
      cb(err);
    });

  stream.on('finish', () => {
    console.log(`finish download: ${imageSrc}`);
    cb(null, imageSrc);
  });
}
exports.showQrcode = showQrcode;

// POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN
function uploadImg(accessToken, imgPath, cb) {
  let options = {
    url: uploadMediaUrl, qs: {access_token: accessToken}, json: true,
    formData: { type: 'image', media: fs.createReadStream(imgPath) },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);
    cb(null, resBody);//{"media_id":"xxxx","url":"yyyy"}
  });
}
exports.uploadImg = uploadImg;

function getHeadImg(url, openid, cb) {
  console.log(url);
  let imageSrc = `./static/head_${openid}.png`;
  let stream = request(url)
    .on('error', (err) => {
      cb(err);
    })
    .pipe(fs.createWriteStream(imageSrc))
    .on('error', (err) => {
      cb(err);
    });

  stream.on('finish', () => {
    console.log(`finish download: ${imageSrc}`);
    cb(null, imageSrc);
  });
}

function generateQrCodeForOneUser(openid, cb) {
  _u.mySeries({
    token: (_cb) => {
      getAccessToken(_cb);
    },
    qrcode: (_cb, ret) => {
      createQrcode(ret.token, openid, _cb);
    },
    qrcodePngPath: (_cb, ret) => {
      showQrcode(ret.qrcode.ticket, openid, _cb);
    },
    userInfo: (_cb, ret) => {
      getUserInfo(ret.token, openid, _cb);
    },
    getHeadImg: (_cb, ret) => {
      getHeadImg(ret.userInfo.headimgurl, openid, _cb);
    },
    composePath: (_cb, ret) => {
      const imgComposer = new ImageComposer();
      imgComposer.compose({
        qrcodeSrc: ret.qrcodePngPath,
        portraitSrc: ret.getHeadImg,
        outputPath: `./static/output_${openid}.png`
      }, _cb);
    },
    upload: (_cb, ret) => {
      uploadImg(ret.token, ret.composePath, _cb);
    }
  }, (err, ret) => {
    if (err) return cb(err);
    cb(null, {
      ticket: ret.qrcode.ticket,
      mediaId: ret.upload.media_id,
      url: ret.upload.url,
    });
  });
}
exports.generateQrCodeForOneUser = generateQrCodeForOneUser;

//POST: https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=ACCESS_TOKEN
function sendTemplateMessage(accessToken, openid, templateid, data, cb) {
  let options = {
    url: templateMsgSendUrl, qs: {access_token: accessToken}, json: true,
    body: {
      touser: openid,
      template_id: 'EMU7DdpXcA-msQkLLwp2R1oZINryZi-uJ9XwpDjvHkI',
      data: {
        name: {
          value: '张宇航',
          color: '#173177'
        },
        score: {
          value: 10,
          color: '#173177'
        }
      }
    },
  };
  request.post(options, (err, response, resBody) => {
    if (err) return cb(err);   
  });
}
exports.sendTemplateMessage = sendTemplateMessage;

function sendScoreMessage(openid, cb) {
  _u.mySeries({
    token: (_cb) => {
      getAccessToken(_cb);
    },
    userInfo: (_cb, ret) => {
      getUserInfo(ret.token, openid, _cb);
    },
    template: (_cb, ret) => {
      sendTemplateMessage(ret.token, openid, '', {
        name: {
          value: ret.userInfo.nickname,
          color: '#173177'
        },
        score: {
          value: 10,
          color: '#173177'
        }
      },  _cb);
    }
  }, (err, ret) => {
  });
}
exports.sendScoreMessage = sendScoreMessage;
