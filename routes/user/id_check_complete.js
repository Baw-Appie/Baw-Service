var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
function isset(text) {
  if(vali.isEmpty(text) == false) {
    return true;
  } else {
    return false;
  }
}


module.exports = function(req, res) {
  try {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      throw new Error('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        throw new Error('Recaptcha 인증에 실패하였습니다.')
      }
    });
    var id = req.body.id
    var password = req.body.password
    var date = new Date().toLocaleDateString()
    var ip = req.connection.remoteAddress
    if(vali.isEmpty(id)){
      throw new Error('ID를 입력해주세요.')
    }
    if(vali.isEmpty(password)){
      throw new Error('비밀번호를 입력해주세요.')
    }
    request.post({url: 'https://authserver.mojang.com/authenticate', json: {agent: {name: "Minecraft",version: 1}, username: id, password: password}}, function(error, response, body){
      console.log(body);
    });
    throw new Error("STOP")
  } catch(e) {
    res.send('<script>alert("' + e.message +'");history.go(-1);</script>')
  }
};
