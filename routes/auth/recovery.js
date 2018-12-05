var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
var sendactionmail = require('../../libs/sendactionmail');

module.exports = async (req, res) => {
  var { id="", mail="" } = req.body
  if(id == "" || mail == ""){
    req.session.error = "모든값을 입력하지 않았습니다."
    return res.redirect('/auth/login')
  }
  var data = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=? AND mail=?", [id, mail]))
  if(data.length == 0) {
    req.session.error = "일치하는 계정이 없습니다."
    return res.redirect('/auth/login')
  } else { data = data[0] }
  sendactionmail(id, mail, "recovery", "계정 비밀번호 복구")
  req.session.error = "비밀번호 복구 메일을 전송했습니다. 메일함을 확인하세요."
  return res.redirect('/auth/login')
}
