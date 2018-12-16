var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')
var SqlString = require('sqlstring')
module.exports = async (req, res) => {
  if(req.user) {
    var service = req.params.service
    if(service == 1) {
      var data = {
        "name": "후원 사이트",
        "service": 1
      }
      var list = ["nick", "bal", "method", "pin", "bouns", "nname", "code", "ip", "date"];
      var korean = ["닉네임", "후원 금액", "후원 방법", "핀번호", "원하는 보상", "입금자명", "발행일(인증코드)", "IP", "날짜"]
      var json = ["bal", "method", "pin", "bouns", "nname", "code"]

      var page = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))
      if(page.length == 0) {
        req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!'
        return res.redirect('/manage')
      }
      var data1 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=1 AND owner=? AND service=1 ORDER BY num DESC limit 10", [req.user.id]))
      var data2 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=2 AND owner=? AND service=1 ORDER BY num DESC limit 5", [req.user.id]))
      var data3 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE owner=? AND service=1", [req.user.id]))
      res.render('manage/data_manager', {rows: page, data: data, data1: data1, data2: data2, data3: data3, list: list, korean: korean, json: json})
    } else if(service == 2) {
      var data = {
        "name": "정품 인증 사이트",
        "service": 2
      }
      var list = ["nick", "ip", "date"]
      var korean = ["닉네임", "IP", "날짜"]

      var page = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))
      if(page.length == 0) {
        req.session.error = '정품 인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!'
        return res.redirect('/manage')
      }
      var data1 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=1 AND owner=? AND service=2 ORDER BY num DESC limit 10", [req.user.id]))
      var data2 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=2 AND owner=? AND service=2 ORDER BY num DESC limit 5", [req.user.id]))
      var data3 = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE owner=? AND service=2", [req.user.id]))
      res.render('manage/data_manager', {rows: page, data: data, data1: data1, data2: data2, data3: data3, list: list, korean: korean, json: []})
    } else {
      res.render('error/403')
    }
  } else {
    res.redirect('/auth/login')
  }
}
