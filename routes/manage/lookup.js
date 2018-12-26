var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var request = require('request');
var server_settings = require('../../config/server_settings');

function captcha(req){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        resolve(true)
      }
    })
  })
}

function countdata(variable, option, regex, json){
  var i = 0
  var data = 0
  while ( i < variable.length ) {
    if(json) {
      temp = Number(JSON.parse(variable[i]['extradata'])[option].replace(regex, ""))
    } else {
      temp = Number(variable[i][option].replace(regex, ""))
    }
    if(!isNaN(temp)){
      data += temp
    }
    i++
  }
  return data
}

module.exports = function (req, res) {
    if(req.body.page && req.body.nick && req.params.service == 1) {
      captcha(req, res).then(function (text) {
        sql.query(SqlString.format('SELECT * from service WHERE service=1 AND page=? AND status=1 AND nick=?', [req.body.page, req.body.nick]), function(err, rows){
          res.json({ success: true, message: countdata(rows, 'bal', /,/gi, true) })
        })
      }).catch(function (error) {
        res.json({ success: false, message: error })
      });
    } else {
      res.json({ success: false, message: "잘못된 페이지 데이터입니다." })
    }
};
