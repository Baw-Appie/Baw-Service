var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');

function req_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined || req.body[item] == ""){
        reject(true)
      }
    })
    resolve(true)
  })
}
function opt_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined){
        reject(true)
      }
    })
    resolve(true)
  })
}
module.exports = function(req, res) {
    if(req.user) {
        if(req.params.service){
          if(req.params.service == "API") {
            var req_field = ["api_enable", "api_key", "api_type"]
            var opt_field = ["api_ip", "api_port"]
          } else if (req.params.service == "SMS") {
            var req_field = ["phone"]
            var opt_field = []
          } else if (req.params.service == "Telegram") {
            var req_field = []
            var opt_field = ["chat_id"]
          } else if (req.params.service == "Custom") {
            var req_field = []
            var opt_field = ["domain"]
          }
          req_check(req_field, req).then(function (text) {
            opt_check(opt_field, req).then(function (text) {
              if(req.params.service == "API") {
                if(!vali.isPort(req.body.api_port)){
                  res.json({ success: false, title: "잘못된 데이터 감지됨",  message: "API PORT가 잘못 입력되었습니다." });
                }
                var sql_Request = SqlString.format('UPDATE `api` SET `api_enable` = ?, `api_key`=?, `api_ip`=?, `api_port`=?, `api_type`=? WHERE `id` =?', [req.body.api_enable, req.body.api_key, req.body.api_ip, req.body.api_port, req.body.api_type, req.user.id])
              } else if (req.params.service == "SMS") {
                if(req.body.phone.length > 13){
                  res.json({ success: false, title: "잘못된 데이터 감지됨",  message: "전화번호를 입력하세요." });
                }
                var sql_Request = SqlString.format('UPDATE `sms` SET `phone`=? WHERE `sms`.`id` = ?', [req.body.phone, req.user.id])
              } else if (req.params.service == "Telegram") {
                if(req.body.chat_id.length > 45){
                  res.json({ success: false, title: "잘못된 데이터 감지됨",  message: "채팅방 ID를 제대로 입력하세요." });
                }
                var sql_Request = SqlString.format('UPDATE `telegram` SET `chat_id` = ? WHERE `telegram`.`id` = ?', [req.body.chat_id, req.user.id])
              } else if (req.params.service == "Custom") {
                sql.query(SqlString.format('SELECT * FROM custom_domain WHERE `domain`=?', [req.body.domain]), function(err, rows){
                  if(err) { throw new Error('1번 질의 오류') }
                  if(rows.length == 1){
                    res.json({ success: false, title: "설정할 수 없습니다.",  message: "이미 동일한 도메인이 등록되어 있습니다." });
                  } else {
                    sql.query(SqlString.format('UPDATE `custom_domain` SET `domain` = ? WHERE `custom_domain`.`owner` = ?', [req.body.domain, req.user.id]))
                    res.json({ success: true, title: "완료했습니다!",  message: "부가 서비스 설정 변경이 요청되었습니다." });
                  }
                })
              }
              if(sql_Request) {
                sql.query(sql_Request)
                res.json({ success: true, title: "완료했습니다!",  message: "부가 서비스 설정 변경이 요청되었습니다." });
              }
            }).catch(function (error) {
              res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 정의되지 않았습니다. 이 문제는 Baw Service의 문제일 가능성이 큽니다." });
            });
          }).catch(function (error) {
            res.json({ success: false, title: "필요 데이터 미전달됨",  message: "모든 입력칸을 채우세요." });
          });
      } else {
        res.json({ success: false, title: "권한이 없습니다.",  message: "부가 서비스 수정 권한이 없습니다." });
      }
  };
}
