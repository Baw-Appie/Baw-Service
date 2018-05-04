var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var SqlString = require('sqlstring');
var crypto = require('crypto');
var request = require('request');
module.exports = function(id, phone, ip){
  return new Promise(function (resolve, reject) {
    sql.query(SqlString.format('SELECT * FROM `2fa` WHERE (phone=? OR ip=?) AND try=3', [phone, ip]), function(err, rows){
      if(err){ throw new Error("1번 질의 오류") }
      if(rows.length != 0){
        return reject({ success: false, title: "발송제한 초과",  message: "인증번호 최대 발송 가능 횟수를 초과했습니다." })
      } else {
        if(phone.length != 11){
          return reject({ success: false, title: "발송 실패",  message: "전화번호는 11자를 입력해야 합니다." })
        }
        var date = Date.now();
        var date = Math.round(date/1000)
        var hmac = crypto.createHmac('md5', server_settings.katalk_ssec)
        var sign = hmac.update(date+server_settings.katalk_salt).digest('hex');
        var code = Math.floor(Math.random() * 100000)
        var formdata = {
          "api_key": server_settings.katalk_skey,
          "timestamp": date,
          "salt": server_settings.katalk_salt,
          "signature": sign,
          "to": "01065540029",
          "from": phone,
          "text": `[Baw Notication] 요청하신 인증 번호입니다.
아래 인증번호를 잘 확인 후 Baw Service에 입력하세요.
인증 번호는 하루에 최대 3회까지 받을 수 있습니다.

인증번호: `+code+`
IP: `+ip+`
브라우저: 알 수 없음

만약 이 인증번호를 본인이 요청한 것이 아니라면 아래 채팅창으로 신고해주세요.
본인이 요청한것이 맞더라도 절대로 이 인증번호를 다른사람에게 알려주지 마세요.

감사합니다.`,
          "type": "ATA",
          "template_code": "2fa",
          "sender_key": server_settings.katalk_senderkey,
          "country": "82",
          "only_ata": true,
          "srk": "K0001142457"
        }
        sql.query(SqlString.format('SELECT * FROM 2fa WHERE phone = ?', [phone]), function(err, rows2){
          if(err){ throw new Error("2번 질의 오류") }
          if(rows2.length == 0){
            sql.query(SqlString.format('insert into `2fa` value (?, ?, 1, ?, ?)', [id,ip,phone,code]))
          } else {
            sql.query(SqlString.format('update `2fa` set try=?+1, code=? where id=?', [rows2[0]['try'],code,id]))
          }
        })
        request.post({url: 'https://api.coolsms.co.kr/sms/2/send', form: formdata}, function(e,r,b){
        });
        return resolve({ success: true, title: "인증번호 발송 요청됨",  message: "인증번호 발송 요청을 카카오톡으로 전송했습니다." })
      }
    })
  })
}
