var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
var crypto = require('crypto');
function isset(text) {
  if(vali.isEmpty(text) == false) {
    return true;
  } else {
    return false;
  }
}


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

    var nick = req.body.nick
    var bal = req.body.bal
    var nname = req.body.nname
    var Combo = req.body.Combo
    if (Combo != "틴캐시") {
      var pin1 = req.body['pin1[]'][0]
      var pin2 = req.body['pin2[]'][0]
      var pin3 = req.body['pin3[]'][0]
      var pin4 = req.body['pin4[]']
    } else {
      var pin1 = req.body['pin1[]'][1]
      var pin2 = req.body['pin2[]'][1]
      var pin3 = req.body['pin3[]'][1]
    }
    var Radio = req.body.Radio
    var page = req.body.page
    var code = req.body.code
    var date = new Date().toLocaleDateString()
    var ip = req.ip
    if(vali.isEmpty(nick) || nick.length > 18){
      return reject('닉네임을 입력해주세요.')
    }
    if(vali.isEmpty(bal) || bal.length > 18){
      return reject('후원금액을 입력해주세요.')
    }
    if(vali.isEmpty(Combo) || Combo.length > 18){
      return reject('후원방법을 선택해주세요.')
    }
    if(Combo != "계좌이체") {
      if(vali.isEmpty(pin1) || pin1.length != 4){
        return reject('핀번호1를 입력해주세요.')
      }
      if(vali.isEmpty(pin2) || pin2.length != 4){
        return reject('핀번호2를 입력해주세요.')
      }
      if(vali.isEmpty(pin3) || pin3.length != 4){
        return reject('핀번호3를 입력해주세요.')
      }
      if(Combo != "틴캐시") {
        if(vali.isEmpty(pin4) || pin1.length > 6 || pin4.length < 3 || pin4.length == 5){
          return reject('핀번호4를 입력해주세요.')
        }
      }
    } else {
      if(vali.isEmpty(nname)) {
        return reject('입금자를 입력해주세요.')
      }
    }
    if(Combo == "틴캐시" || Combo == "해피머니" || Combo == "도서문화상품권") {
      if(vali.isEmpty(code) || code.length > 18){
        return reject('인증 번호(발행일)을 입력해주세요.')
      }
    } else {
      var code = "없음"
    }

    var sql_req = sql.query('SELECT * FROM page WHERE name='+ SqlString.escape(page)+' and service=1', function(err, rows) {
      if (err) { return reject('1번 질의 오류') }
      if (rows.length == 0) { return reject('후원 홈페이지가 존재하지 않습니다.') }
      var sql_req2 = sql.query('SELECT * FROM id WHERE id='+ SqlString.escape(rows[0]['owner']), function(err, rows2) {
        if (err) { return reject('2번 질의 오류') }
        var sql_req3 = sql.query('SELECT * FROM service1 ORDER BY `num` ASC', function(err, rows3) {
          if (err) { return reject('3번 질의 오류') }
          var counter = rows3.length;
          rows3.forEach(function(item) {
            counter -= 1;
            if ( counter === 0){
              var no = item.num + 1
              if(Combo == "틴캐시"){
                 var pincode = pin1+'-'+pin2+'-'+pin3
      	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pincode, Combo, code, Radio, ip, date]);
               } else if (Combo == "계좌이체") {
         	       var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, "없음", ?, ?, ?, ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, Combo, code, nname, Radio, ip, date]);
               } else {
                  var pincode = pin1+'-'+pin2+'-'+pin3+'-'+pin4
       	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pincode, Combo, code, Radio, ip, date]);
               }
              var sql_req4  = sql.query(sql_Request, function(err, rows4) {
                if (err) { return reject('4번 질의 오류'); }

                if(rows[0]['mail_ok'] == 1) {
                  var nodemailer = require('nodemailer');
                  var transporter = require('../../libs/mail_init');
                  var mailOptions = {
                    from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
                    to: rows2[0]['mail'],
                    subject: '[Baw Service] 새로운 후원 요청이 있습니다!',
                    html: "<p>Baw Service에서 새로운 후원 요청이 있습니다!</p><p>후원 관리 사이트를 확인해주세요!</p><p><a href=\"https://"+req.hostname+"/manage/1/view\">[Baw Service 관리 사이트]</a></p><p>Powered by <a href='https://baws.kr/'>Baw Service</a></p>"
                  };
                  transporter.sendMail(mailOptions, function(error, info) {
                    transporter.close();
                    if(error) {
                      return reject('후원 등록에는 성공하였으나 알림 메일 발송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
                    }
                  });
                }

                if(rows[0]['sms_ok'] == 1) {
                  sql.query(SqlString.format('SELECT * FROM sms WHERE send=0 AND id=?', [rows[0]['owner']]), function(err, rows5){
                    if (err) { return reject('5번 질의 오류'); }
                    if(rows5.length == 1){
                      var formdata = {data: JSON.stringify({id: server_settings.sms_id, pw: crypto.createHash('sha256').update(server_settings.sms_pw).digest('hex'), code: '5325', type: 'A', caller: server_settings.sms_caller, toll: rows5[0]['phone'], html: '1'}), msg: '새로운 후원이 있습니다! https://baws.kr'}
                      request.post({url: 'http://smsapi.dotname.co.kr/index.php', form: formdata}, function(error, response, body){
                        sql.query(SqlString.format('update sms set send = send+1 where id = ?', [rows[0]['owner']]))
                        if(body != "@1"){
                          return reject('후원 등록에는 성공하였으나 알림 문자 전송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
                        }
                      })
                    }
                  })
                } else {

                  if(rows[0]['kakao_ok'] == 1) {
                    sql.query(SqlString.format('SELECT * FROM katalk WHERE send=0 AND id=?', [rows[0]['owner']]), function(err, rows7){
                      if (err) { return reject('7번 질의 오류'); }
                      if(rows7.length == 1){
                        var headers = {
                            'Accept': 'application/json',
                            'Content-type': 'application/json',
                            'userId': server_settings.katalk_id
                        };
                        var formdata = `[{"message_type": "at","phn": "`+rows7[0]['phone']+`","profile": "`+server_settings.katalk_senderkey+`","reserveDt": "00000000000000","msg": "[Baw Notication] `+rows2[0]['svname']+` 상점에 직접 등록하셔서 판매중이던 `+Radio+`(이)가 판매되었습니다.\n\n상품명: `+Radio+`\n구매자명: `+nick+`\n구매 일시: `+date+`\n구매 금액: `+bal+`\n\n`+date+`에 이 알림 수신에 동의하셨으며, 더 이상 수신을 원하지 않으실 경우 아래 채팅창으로 알려주시기 바랍니다.","tmplId": "N08","smsKind": "N", "button1": {"name":"판매자 페이지", "type":"WL","url_mobile":"https://baws.kr/manage/1/view"}}]`
                        console.log(formdata)
                        request.post({url: 'https://alimtalk-api.bizmsg.kr/v2/sender/send', headers: headers, body: formdata}, function(e,r,b){
                          sql.query(SqlString.format('update katalk set send = send+1 where id = ?', [rows[0]['owner']]))
                          console.log(b)
                          b = JSON.parse(b);
                          if(b.code == "fail"){
                            return reject('후원 등록에는 성공하였으나 알림 문자 전송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
                          }
                        })
                      }
                    })
                  }
                }
                if(rows[0]['tg_ok'] == 1) {
                  sql.query(SqlString.format('SELECT * FROM telegram WHERE id=?', [rows[0]['owner']]), function(err, rows6){
                    if (err) { return reject('6번 질의 오류'); }
                    if(rows6.length == 1){
                      request('https://api.telegram.org/bot'+server_settings.tg_bot_key+'/getChat?chat_id='+rows6[0]['chat_id'], function(err, res, body) {
                        body = JSON.parse(body);
                        if(body.ok == true){
                          const { TelegramClient } = require('messaging-api-telegram');
                          const client = TelegramClient.connect(server_settings.tg_bot_key);
                          client.sendMessage(rows6[0]['chat_id'], '새로운 후원이 있습니다! https://baws.kr');
                        }
                      })
                    }
                  })
                }

                resolve("<script>alert('후원 요청이 완료되었습니다.');location.replace('https://"+req.hostname+"/"+page+"');</script>")
              })
            }
          });
        })
      })
    })
  })
}


module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	res.send(text);
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
};
