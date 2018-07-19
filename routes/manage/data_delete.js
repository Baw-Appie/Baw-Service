var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var sendactionmail = require('../../libs/sendactionmail');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
var crypto = require('crypto');

function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      }
    });
    sql.query('SELECT * FROM pages WHERE owner='+ SqlString.escape(req.user.id), function(err, rows) {
      if (err) { return reject('1번 질의 오류') }
      if (rows.length == 0) { return reject('페이지가 존재하지 않습니다.') }

      sendactionmail(req.user.id, req.user.mail, "delete_"+req.params.service, "데이터 삭제").then(function (text) {
        return resolve("확인 메일을 전송했습니다. Baw Service 등록시 사용하신 이메일을 확인해주세요.")
      }).catch(function (error) {
        return reject("오류가 발생했습니다." + error)
      });
    })
  })
}


module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	res.json({ success: true, title: "완료했습니다!", message: text});
  }).catch(function (error) {
  	res.json({ success: false, title: "문제가 발생했습니다.", message: error});
  });
};
