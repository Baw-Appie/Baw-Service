var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
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
    if(req.params.service == 1) {
      var nick = req.body.nick
      var bal = req.body.bal
      var nname = req.body.nname
      var method = req.body.method
      var pin = req.body.pin
      var bouns = req.body.bouns
      var code = req.body.code
      var date = req.body.date
      var ip = req.body.ip
      var status = req.body.status
      if(vali.isEmpty(nick) || nick.length > 18){
        return reject('닉네임을 입력해주세요.')
      }
      if(vali.isEmpty(bal) || bal.length > 18){
        return reject('후원금액을 입력해주세요.')
      }
      if(vali.isEmpty(method) || method.length > 18){
        return reject('후원방법을 입력해주세요.')
      }
      if(vali.isEmpty(pin) || pin.length > 22){
        return reject('핀번호를 입력해주세요.')
      }
      if(vali.isEmpty(nname)) {
        return reject('입금자를 입력해주세요.')
      }
      if(vali.isEmpty(bouns)) {
        return reject('후원 보너스를 입력해주세요.')
      }
      if(vali.isEmpty(ip) || ip.length > 18) {
        return reject('입금자를 입력해주세요.')
      }
      if(vali.isEmpty(code) || code.length > 18){
        return reject('인증 번호(발행일)을 입력해주세요.')
      }
      if(status != 0 && status !=  1 && status !=  2){
        return reject('처리 상태를 제대로 선택해주세요.' + status)
      }
      sql.query('SELECT * FROM pages WHERE owner='+ SqlString.escape(req.user.id)+' and service=1', function(err, rows) {
        if (err) { return reject('1번 질의 오류') }
        if (rows.length == 0) { return reject('후원 홈페이지가 존재하지 않습니다.') }
        sql.query('SELECT * FROM service1 ORDER BY `num` ASC', function(err, rows3) {
          if (err) { return reject('3번 질의 오류') }
          var counter = rows3.length;
          rows3.forEach(function(item) {
            counter -= 1;
            if ( counter === 0){
              var no = item.num + 1
       	      var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [no, rows[0]['name'], rows[0]['owner'], nick, bal, pin, method, code, nname, bouns, ip, date, status]);
              var sql_req4  = sql.query(sql_Request, function(err, rows4) {
                if (err) { return reject('4번 질의 오류'); }
                resolve("등록되었습니다.")
              })
            }
          });
        })
      })
    } else {
      return reject('후원 사이트에서만 사용할 수 있습니다.')
    }
  })
}


module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	res.json({ success: true, title: "완료했습니다!", message: text});
  }).catch(function (error) {
  	res.json({ success: false, title: "문제가 발생했습니다.", message: error});
  });
};
