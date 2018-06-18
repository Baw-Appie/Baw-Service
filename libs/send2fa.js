var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var SqlString = require('sqlstring');
var crypto = require('crypto');
var request = require('request');
module.exports = function(id, phone, ip){
  return new Promise(function (resolve, reject) {
    sql.query(SqlString.format('SELECT * FROM `2fa` WHERE (phone=? OR ip=? OR id=?) AND try=3', [phone, ip, id]), function(err, rows){
      if(err){ throw new Error("1번 질의 오류") }
      if(rows.length != 0){
        return reject({ success: false, title: "발송제한 초과",  message: "인증번호 최대 발송 가능 횟수를 초과했습니다." })
      } else {
        if(phone.length != 12){
          return reject({ success: false, title: "발송 실패",  message: "전화번호는 한국 국제번호 형식으로 12자를 입력해야 합니다." })
        }
        var code = Math.floor(Math.random() * 100000)
        var headers = {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'userId': server_settings.katalk_id
        };
        var formdata = `[{"message_type": "at","phn": `+phone+`,"profile": "`+server_settings.katalk_senderkey+`","reserveDt": "00000000000000","msg": "[Baw Notication] 요청하신 인증 번호입니다.\n\n인증번호: `+code+`\nIP: `+ip+`\n브라우저: 알 수 없음\n\n이 코드는 Baw Service의 중요한 데이터를 추가/수정/삭제시 필요한 코드입니다.\n저희는 이 코드를 절대로 요청하지 않으며, 만약 다른 사람이 요청할 때 절대로 알려주지 마시기 바랍니다.\n\n만약 직접 요청하지 않으셨다면, 무시해주시거나 아래 채팅창으로 신고해주시기 바랍니다.","tmplId": "N03","smsKind": "N"}]`
        sql.query(SqlString.format('SELECT * FROM 2fa WHERE phone = ?', [phone]), function(err, rows2){
          if(err){ throw new Error("2번 질의 오류") }
          if(rows2.length == 0){
            sql.query(SqlString.format('insert into `2fa` value (?, ?, 1, ?, ?)', [id,ip,phone,code]))
          } else {
            sql.query(SqlString.format('update `2fa` set try=try+1, code=? where id=?', [code,id]))
          }
        })
        request.post({url: 'https://alimtalk-api.bizmsg.kr/v2/sender/send', headers: headers, body: formdata}, function(e,r,b){
        });
        return resolve({ success: true, title: "인증번호 발송 요청됨",  message: "인증번호 발송 요청을 카카오톡으로 전송했습니다." })
      }
    })
  })
}
