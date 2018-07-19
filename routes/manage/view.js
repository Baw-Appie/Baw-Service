var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원",
          "service": 1
        }
        var list = ["nick", "bal", "method", "pin", "bouns", "nname", "code", "ip", "date"];
        var korean = ["닉네임", "후원 금액", "후원 방법", "핀번호", "원하는 보상", "입금자명", "발행일(인증코드)", "IP", "날짜"]

        sql.query('select * from pages where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
    		  } else {
            sql.query('select * from service1 where status=0 and owner=' + SqlString.escape(req.user.id), function(err, rows){
              sql.query('select * from auth where owner=' + SqlString.escape(req.user.id), function(err, rows2){
                if(rows2.length == 1){
                  var authed = true
                } else {
                  var authed = false
                }
                res.render('manage/view', {rows: rows, data: data, list: list, korean: korean, authed: authed})
              });
            });
          }
    		});
      }
      if(req.params.service == 2) {
        var data = {
          "name": "정품 인증",
          "service": 2
        }
        var list = ["nick", "ip", "date"];
        var korean = ["닉네임", "IP", "날짜"];

        sql.query('select * from pages where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
    		  } else {
            sql.query('select * from service2 where status=0 and owner=' + SqlString.escape(req.user.id), function(err, rows){
              res.render('manage/view', {rows: rows, data: data, list: list, korean: korean})
            });
          }
    		});
      }
  } else {
    res.redirect('/auth/login')
  }
}
