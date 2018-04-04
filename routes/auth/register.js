var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');



function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        reject('Recaptcha 인증에 실패하였습니다.')
      }
    });

    var id = req.body.id
    var pass = req.body.pass
    var pass2 = req.body.pass2
    var mail = req.body.mail
    var svname = req.body.svname
    var date = new Date().toLocaleDateString()
    if(vali.isEmpty(id)){
      reject('ID를 입력해주세요.')
    }
    if(vali.isEmpty(pass)){
      reject('비밀번호를 입력해주세요.')
    }
    if(vali.isEmpty(pass2)){
      reject('비밀번호 확인을 입력해주세요.')
    }
    if(vali.isEmail(mail) == false){
      reject('이메일을 입력해주세요.')
    }
    if(vali.isEmpty(svname)){
      reject('서버 이름을 입력해주세요.')
    }

    if(pass != pass2){
      reject('비밀번호가 비밀번호 확인과 일치하지 않습니다.')
    }

    var sql_Request = SqlString.format('SELECT * FROM id WHERE id=?', [id])
    var sql_req = sql(sql_Request, function(err, rows){
      if(err){ reject('1번 질의 오류') }
      if(rows.length != 0){
        reject('이미 존재하는 ID입니다.')
      } else {
        var sql_Request = SqlString.format('SELECT * FROM id WHERE mail=?', [mail])
        var sql_req = sql(sql_Request, function(err, rows2){
          if(err){ reject('2번 질의 오류') }
          if(rows2.length != 0){
            reject('이미 등록된 이메일입니다.')
          } else {
            // TODO: SQL을 이용하여 유저 데이터 추가 및 이메일 인증 + 이메일 인증을 통해서 SMS 서비스 자동 가입
          }
        })
      }
    })
  })
}




module.exports = function(req, res){
  complete(req, res).then(function (text) {
  	console.log(text);
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
}
