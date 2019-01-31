var sql = require('../config/dbtool')
var sqlp = require('../libs/sql-promise')
var SqlString = require('sqlstring')

module.exports = async (req, res) => {
  if(!req.params.code){
    return res.json({ success: false, message: "코드 입력 필수"})
  }
  var data = await sqlp(sql, SqlString.format('select * from actionmail where code=?', [req.params.code]))
  if(data.length == 0){
    return res.json({ success: false, message: "알 수 없는 코드"})
  } else { data = data[0] }

  if(data['action'] == "delete_page_1"){
    if((await sqlp(sql, SqlString.format("SELECT * FROM service WHERE service=1 owner=?", [data['id']]))).length != 0) {
      req.session.error = '아직은 사이트를 삭제할 수 없습니다.'
    }
    sql.query(SqlString.format('delete from pages where service=1 AND owner=?', [data['id']]))
    req.session.error = '성공적으로 후원 사이트를 삭제했습니다.'
  } else if(data['action'] == "delete_page_2"){
    if((await sqlp(sql, SqlString.format("SELECT * FROM service WHERE service=2 owner=?", [data['id']]))).length != 0) {
      req.session.error = '아직은 사이트를 삭제할 수 없습니다.'
    }
    sql.query(SqlString.format('delete from pages where service=2 AND owner=?', [data['id']]))
    req.session.error = '성공적으로 정품인증 사이트를 삭제했습니다.'
  } else if(data['action'] == "delete_page_3"){
    sql.query(SqlString.format('delete from pages where service=3 AND owner=?', [data['id']]))
    req.session.error = '성공적으로 서버 상태 확인 사이트를 삭제했습니다.'
  } else if(data['action'] == "delete_1"){
    sql.query(SqlString.format('delete from service where service=1 AND owner=?', [data['id']]))
    req.session.error = '성공적으로 후원 사이트의 모든 데이터를 삭제했습니다.'
  } else if(data['action'] == "delete_2"){
    sql.query(SqlString.format('delete from service where service=2 AND owner=?', [data['id']]))
    req.session.error ='성공적으로 정품인증 사이트의 모든 데이터를 삭제했습니다.'
  } else if(data['action'] == "recovery"){
    return res.render('auth/setPassword', { code: req.params.code })
  }

  await sqlp(sql, SqlString.format("DELETE FROM actionmail where code=?", [req.params.code]))
  return res.redirect('/')
}
