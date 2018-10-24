var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  if(req.user) {
    var { svname="", ninfo="", oldpass="", pass="", pass2="" } = req.body
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
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "먼저 로그인해주세요." });
  }
}
