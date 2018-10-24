var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
module.exports = async (req, res) => {
  if(req.user) {
    var service = req.params.service
    switch(service) {
      case "1":
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        if ((await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))).length == 0) {
          res.render('manage/create', { data: data })
        } else {
          req.session.error = '후원 홈페이지가 이미 존재합니다.';
          res.redirect('/')
        }
        break;
      case "2":
        var data = {
          "name": "정품 인증 사이트",
          "service": 3
        }
        if ((await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=2 AND owner=?", [req.user.id]))).length == 0) {
          res.render('manage/create', { data: data })
        } else {
          req.session.error = '정품 인증 홈페이지가 이미 존재합니다.';
          res.redirect('/')
        }
        break;
      case "3":
        var data = {
          "name": "서버 상태  사이트",
          "service": 3
        }
        if ((await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=3 AND owner=?", [req.user.id]))).length == 0) {
          res.render('manage/create', { data: data })
        } else {
          req.session.error = '서버 상태  홈페이지가 이미 존재합니다.';
          res.redirect('/')
        }
        break;
    }
  } else {
    res.redirect('/auth/login')
  }
}
