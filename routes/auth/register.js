var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var session_config = require('../../config/session');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');


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

    var id = req.body.id
    var pass = req.body.pass
    var pass2 = req.body.pass2
    var mail = req.body.mail
    var svname = req.body.svname
    var date = new Date().toLocaleDateString()
    if(vali.isEmpty(id)){
      return reject('ID를 입력해주세요.')
    }
    if(vali.isEmpty(pass)){
      return reject('비밀번호를 입력해주세요.')
    }
    if(vali.isEmpty(pass2)){
      return reject('비밀번호 확인을 입력해주세요.')
    }
    if(vali.isEmail(mail) == false){
      return reject('이메일을 입력해주세요.')
    }
    if(vali.isEmpty(svname)){
      return reject('서버 이름을 입력해주세요.')
    }

    if(pass != pass2){
      return reject('비밀번호가 비밀번호 확인과 일치하지 않습니다.')
    }

    var sql_Request = SqlString.format('SELECT * FROM id WHERE id=?', [id])
    var sql_req = sql.query(sql_Request, function(err, rows){
      if(err){ return reject('1번 질의 오류') }
      if(rows.length != 0){
        return reject('이미 존재하는 ID입니다.')
      } else {
        var sql_Request2 = SqlString.format('SELECT * FROM id WHERE mail=?', [mail])
        var sql_req2 = sql.query(sql_Request2, function(err, rows2){
          if(err){ return reject('2번 질의 오류') }
          if(rows2.length != 0){
            return reject('이미 등록된 이메일입니다.')
          } else {
            var enc_mail = require('md5')('mail' + 'session_config.secret')
            var sql_Request3 = SqlString.format('insert into id values (?, password(?), ?, ?, ?, 0, ?, \'\', 0, \'\', 3203, \'socket\', \'\', \'0000-00-00\')', [id, pass, mail, svname, date, enc_mail])
            var sql_req3 = sql.query(sql_Request3, function(err, rows3){
              if(err){ return reject('3번 질의 오류') }

              var nodemailer = require('nodemailer');
              var transporter = require('../../libs/mail_init');
              var mailOptions = {
                from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
                to: mail,
                subject: '[Baw Service] 가입 확인 이메일입니다.',
                html: '유저님이 Baw Service에서 요청하신 링크는 다음과 같습니다.<br><br><a href=\"https://'+req.hostname+'/auth/check-email?key='+enc_mail+'">[인증하기]</a><br>또는 아래 링크를 직접 복사해서 접속하세요.<br><br>https://'+req.hostname+'/auth/check-email?key='+enc_mail+'<br><br>감사합니다.'
              };
              transporter.sendMail(mailOptions, function(error, info) {
                transporter.close();
                if(error) {
                  return reject('인증 메일 발송 오류입니다. 관리자(카카오톡 pp121324)에게 문의하세요.')
                }
              });

              console.info('회원가입 성공!')
              resolved(true)
            })
          }
        })
      }
    })
  })
}




module.exports = function(req, res){
  complete(req, res).then(function (text) {
    req.session.error = "Baw Service에서 인증 메일을 보냈습니다. 인증 메일을 확인해주세요."
    res.redirect('/')
    console.info('회원가입 성공!')
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
}
