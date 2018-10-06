var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
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
    (async () => {
      try { await req_check(["svname"], req) } catch { return res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 정의되지 않았습니다. 이 문제는 Baw Service의 문제일 가능성이 큽니다." }) }
      try { await opt_check(["ninfo"], req) } catch { res.json({ success: false, title: "필요 데이터 미전달됨",  message: "필수 입력칸을 모두 채우세요." }) }
      var { svname, ninfo, oldpass, pass1, pass2 } = req.body
      await sqlp(sql, SqlString.format('UPDATE `users` SET userdata=json_set(userdata, "$.svname", ?, "$.ninfo", ?) WHERE `id` = ?', [svname, ninfo, req.user.id]))

      if(oldpass != "" && pass1 != "" && pass2 != "") {
        if(pass1 != pass2){
          return res.json({ success: false, title: "정보 변경 요청 성공 및 비밀번호 불일치",  message: "정보 변경 요청에 성공했지만, 비밀번호 확인이 일치하지 않아 비밀번호가 변경되지 않았습니다." })
        }
        if((await sqlp(sql, SqlString.format('select * from users where id=? and password=password(?)', [req.user.id, oldpass]))).length == 0){
          return res.json({ success: false, title: "정보 변경 요청 성공 및 비밀번호 불일치",  message: "정보 변경 요청에 성공했지만, 기존 비밀번호가 일치하지 않아 비밀번호가 변경되지 않았습니다." })
        }
        await sqlp(sql, SqlString.format('UPDATE `users` SET `password`=password(?) WHERE `id` = ?', [pass1, req.user.id]))
        return res.json({ success: true, title: "완료했습니다!",  message: "정보변경 요청과 비밀번호 변경 요청이 완료되었습니다." })
      }
      return res.json({ success: true, title: "완료했습니다!",  message: "정보변경 요청이 완료되었습니다." })

    })()


    // var req_field = ["svname"]
    // var opt_field = ["ninfo"]
    // req_check(req_field, req).then(function (text) {
    //   opt_check(opt_field, req).then(function (text) {
    //     var sql_Request = SqlString.format('UPDATE `users` SET userdata=json_set(userdata, "$.svname", ?, "$.ninfo", ?) WHERE `id` = ?', [req.body.svname, req.body.ninfo, req.user.id])
    //     console.log(sql_Request)
    //     sql.query(sql_Request)
    //     res.json({ success: true, title: "완료했습니다!",  message: "성공적으로 나의 정보 변경이 요청되었습니다." });
    //   }).catch(function (error) {
    //     res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 정의되지 않았습니다. 이 문제는 Baw Service의 문제일 가능성이 큽니다." });
    //   });
    // }).catch(function (error) {
    //   res.json({ success: false, title: "필요 데이터 미전달됨",  message: "모든 입력칸을 채우세요." });
    // });
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "먼저 로그인해주세요." });
  }
}
