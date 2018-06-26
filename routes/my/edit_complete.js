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
    var req_field = ["svname"]
    var opt_field = ["ninfo"]
    req_check(req_field, req).then(function (text) {
      opt_check(opt_field, req).then(function (text) {
        var sql_Request = SqlString.format('UPDATE `id` SET `svname`=?, `ninfo`=? WHERE `id`.`id` = ?', [req.body.svname, req.body.ninfo, req.user.id])
        var sql_req = sql.query(sql_Request)
        res.json({ success: true, title: "완료했습니다!",  message: "성공적으로 나의 정보 변경이 요청되었습니다." });
      }).catch(function (error) {
        res.json({ success: false, title: "필요 데이터 미전달됨",  message: "모든 입력칸을 채우세요." });
      });
    }).catch(function (error) {
      res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 정의되지 않았습니다. 이 문제는 Baw Service의 문제일 가능성이 큽니다." });
    });
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "먼저 로그인해주세요." });
  }
}
