var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
var vali = require('validator');

module.exports = async (req, res) => {
  if(req.user) {
    try {
      var success = true
      var { phone, code } = req.body
      if (vali.isEmpty(code)) {
        thorw ('인증번호를 입력해주세요')
      }
      if (vali.isEmpty(phone)) {
        thorw ('ID를 입력해주세요.')
      }
      if ((await sqlp(sql, "SELECT * FROM katalk WHERE id=?", [req.user.id])).length != 0) {
        thorw ('이미 카카오톡 알림 서비스에 등록되어 있습니다.')
      }
      var data = await sqlp(sql, "SELECT * FROM 2fa WHERE id=? and phone=?", [req.user.id, phone])
      if (data.length == 0) {
        thorw ('인증번호를 요청한적이 없습니다.')
      }
      if (data[0]['code']) {
        thorw ('인증번호가 일치하지 않습니다. 인증번호를 다시 확인하세요.')
      }
      var sql_Request = SqlString.format("INSERT INTO katalk values (?, ?, 0)", [req.user.id, phone, 0])
      try { await sqlp(sql, sql_Request) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        var msg = "인증번호 처리에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n(" + err + ")"
      } else {
        var msg = "인증번호 처리에 실패했습니다! (" + err + ")"
      }
      success = false
    } finally {
      if (success) {
        return res.json({ success: success, title: "부가서비스 가입 성공", message: msg })
      } else {
        return res.json({ success: success, title: "부가서비스 가입 실패", message: msg })
      }
    }
  }
}
