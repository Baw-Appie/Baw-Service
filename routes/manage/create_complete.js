var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var session_config = require('../../config/session');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');

function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.user) {
      var service = req.params.service
      var name = req.body.name
      var date = new Date().toLocaleDateString()
      if(vali.isEmpty(service)){
        return reject('오류')
      }
      if(vali.isEmpty(name)){
        return reject('ID를 입력해주세요.')
      }
      sql(SqlString.format("SELECT * FROM page WHERE owner=? and service=?", [req.user.id, service]), function(err,rows){
        if(err) { return reject("1번 질의 오류") }
        if(rows.length != 0){
          return reject("이미 페이지를 소유하고 있습니다.")
        }
        sql(SqlString.format("SELECT * FROM page WHERE name=?", [name]), function(err,rows2){
          if(err) { return reject("2번 질의 오류") }
          if(rows2.length != 0){
            return reject("이미 존재하는 페이지입니다.")
          }

          if(service == 1) {
            var sql_Request = SqlString.format("insert into page values (?, 1, ?, ?, 0, 1, 0, 0, 1, 0, '없음', '', '', '', 0, '아래 정보를 입력해주시면 최대한 빠르게 처리해 드리겠습니다.', 'bootstrap3', NULL, 0)", [name, req.user.id, date])
          }
          if(service == 2) {
            var sql_Request = SqlString.format("insert into page values (?, 2, ?, ?, 0, 1, 0, 0, 0, 0, '없음', '', '', '', 0, '아래 정보 입력 후 전송시 전송된 데이터는 정품 인증 사이트에 전송되며 이때 저장되지 않고 바로 Mojang에 연결하여 정품 아이디가 맞는지 확인 후 아이디와 IP주소만 저장됩니다.', 'bootstrap3', NULL, 1)", [name, req.user.id, date])
          }
          if(service == 3) {
            var sql_Request = SqlString.format("insert into page values (?, 3, ?, ?, 0, 0, 0, 0, 0, 0, '없음', '', '', '', 25565, '이 정보는 부정확할 수 있으니 직접 접속하여 확인해보시기 바랍니다.', 'bootstrap3', NULL, 0)", [name, req.user.id, date])
          }

          sql(sql_Request, function(err, rows3){
            if(err) { return reject("3번 질의 오류") }
            req.session.error("페이지가 생성되었습니다! 페이지 설정에서 설정을 수정하여 페이지를 완성시키세요!")
            resolve("페이지 생성에 성공했습니다.")
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
  	res.redirect("/")
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
}
