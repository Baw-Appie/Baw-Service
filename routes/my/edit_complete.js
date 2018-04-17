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
        var sql_req = sql(sql_Request)
        res.json({ success: true, title: "완료했습니다!",  message: "정보 변경 요청이 전달되었습니다." });
      }).catch(function (error) {
        res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 전달되지 않았습니다." });
      });
    }).catch(function (error) {
      res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 전달되지 않았거나 설정되지 않았습니다." });
    });
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "정보 변경 요청 권한이 없습니다." });
  }
}
