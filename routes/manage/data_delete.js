var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var server_settings = require('../../config/server_settings');
var sendactionmail = require('../../libs/sendactionmail');
var SqlString = require('sqlstring');
var request = require('request');

function Recaptcha(req){
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
        resolve("성공했습니다.")
      }
    });
  })
}

module.exports = async (req, res) => {
  if(req.user) {
    try {
      await Recaptcha(req)
      var data = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE owner=?", [req.user.id]))
      if (data.length == 0) { throw('페이지가 존재하지 않습니다.') }
      sendactionmail(req.user.id, req.user.mail, "delete_"+req.params.service, "데이터 삭제")
      var msg = "확인 메일을 전송했습니다. Baw Service 등록시 사용하신 이메일을 확인해주세요."
    } catch(err) {
      console.log(err)
      if(err instanceof Error) {
        var msg = "메일 발송 시스템에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n("+err+")"
      } else {
        var msg = "메일 발송에 실패했습니다! ("+err+")"
      }
    } finally {
      res.send('<script>alert("' + msg +'");history.go(-1);</script>')
    }
  }
}
