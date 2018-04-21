var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var session_config = require('../../config/session');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');

function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.user) {
      var phone = req.body.phone
      var code = req.body.code
      if(vali.isEmpty(code)){
        return reject('인증번호를 입력해주세요')
      }
      if(vali.isEmpty(phone)){
        return reject('ID를 입력해주세요.')
      }
      sql.query(SqlString.format("SELECT * FROM katalk WHERE id=?", [req.user.id]), function(err,rows){
        if(err) { return reject("1번 질의 오류") }
        if(rows.length != 0){
          return reject({ success: false, title: "부가서비스 가입 실패", message: "이미 부가서비스를 이용하고 있습니다."})
        }
        sql.query(SqlString.format("SELECT * FROM 2fa WHERE id=?", [req.user.id]), function(err,rows2){
          if(err) { return reject("2번 질의 오류") }
          if(rows2.length == 0){
            return reject({ success: false, title: "부가서비스 가입 실패", message: "인증번호를 요청하지 않은 것 같습니다."})
          }
          if(rows2[0]['code'] != code){
            return reject({ success: false, title: "부가서비스 가입 실패", message: "인증번호가 일치하지 않습니다. 인증번호를 다시 입력하세요."})
          }
          if(rows2[0]['phone'] != phone){
            return reject({ success: false, title: "부가서비스 가입 실패", message: "전화번호가 변경되었습니다."})
          }

          sql.query(SqlString.format('insert into katalk values (?, ?)', [req.user.id, phone]), function(err, rows3){
            if(err) { return reject("3번 질의 오류") }
            return reject({ success: true, title: "부가서비스 가입 성공", message: "부가서비스 가입에 성공했습니다."})
          })

        })
      })
    } else {
      return reject("로그인이 필요합니다")
    }
  })
}




module.exports = function(req, res){
  complete(req, res).then(function (text) {
  	res.json(text)
  }).catch(function (error) {
  	res.json(error)
  });
}
