var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  var { pass1="", pass2="", code="" } = req.body
  if(pass1 == "" || pass2 == "" || code == ""){
    req.session.error = "모든값을 입력하지 않았습니다."
    return res.redirect('/auth/login')
  }
  if(pass1 != pass2){
    req.session.error = "비밀번호가 서로 일치하지 않습니다."
    return res.redirect('/auth/login')
  }
  var data = await sqlp(sql, SqlString.format("select * from actionmail where code=?", [code]))
  if(data.length == 0) {
    req.session.error = "일치하는 계정이 없습니다."
    return res.redirect('/auth/login')
  } else { data = data[0] }
  await sqlp(sql, SqlString.format("UPDATE users SET password=password(?) WHERE id=?", [pass1, data['id']]))
  await sqlp(sql, SqlString.format("DELETE FROM actionmail where code=?", [code]))
  req.session.error = "비밀번호가 업데이트되었습니다."
  return res.redirect('/auth/login')
}
