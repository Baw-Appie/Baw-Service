var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        var sql_req = sql.query('select * from page where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length != 0) {
            req.session.error = '후원 홈페이지가 이미 존재합니다.';
            res.redirect('/')
          } else {
            res.render('manage/create', {rows: rows, data: data})
          }
        });
      } else if(req.params.service == 2) {
        var data = {
          "name": "정품 인증 사이트",
          "service": 2
        }
        var sql_req = sql.query('select * from page where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length != 0) {
            req.session.error = '정품 인증 페이지가 이미 존재합니다.';
            res.redirect('/')
          } else {
            res.render('manage/create', {rows: rows, data: data})
          }
        });
      } else if(req.params.service == 3) {
        var data = {
          "name": "서버 상태 위젯",
          "service": 3
        }
        var sql_req = sql.query('select * from page where service=3 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length != 0) {
            req.session.error = '서버 상태 위젯이 이미 존재합니다.';
            res.redirect('/')
          } else {
            res.render('manage/create', {rows: rows, data: data})
          }
        });
      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
