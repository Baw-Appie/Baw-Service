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
        if(phone.length != 11){
          return reject({ success: false, title: "발송 실패",  message: "전화번호는 한국전화번호로 11자를 입력해야 합니다." })
        }
        var code = Math.floor(Math.random() * 100000)
        // var headers = {
        //     'Accept': 'application/json',
        //     'Content-type': 'application/json',
        //     'userId': server_settings.katalk_id
        // };
        var formdata = {
          api_key: server_settings.katalk_api_key,
          template_code: server_settings.katalk_2fa_template,
          variable: code+"|"+ip+"|알 수 없음|사용자 인증|Baw Service",
          callback: server_settings.katalk_caller,
          dstaddr: phone,
          next_type: 0,
          send_reserve: 0
        }
        sql.query(SqlString.format('SELECT * FROM 2fa WHERE phone = ?', [phone]), function(err, rows2){
          if(err){ throw new Error("2번 질의 오류") }
          if(rows2.length == 0){
            sql.query(SqlString.format('insert into `2fa` value (?, ?, 1, ?, ?)', [id,ip,phone,code]))
          } else {
            sql.query(SqlString.format('update `2fa` set try=try+1, code=? where id=?', [code,id]))
          }
        })
        request.post({url: 'http://'+server_settings.katalk_server+'/API/alimtalk_api', form: formdata}, function(e,r,b){ });
        return resolve({ success: true, title: "인증번호 발송 요청됨",  message: "인증번호 발송 요청을 카카오톡으로 전송했습니다." })
      }
    })
  })
}
