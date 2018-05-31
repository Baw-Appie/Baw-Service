var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        var list = ["nick", "bal", "method", "pin", "bouns", "nname", "code", "ip", "date"];
        var korean = ["닉네임", "후원 금액", "후원 방법", "핀번호", "원하는 보상", "입금자명", "발행일(인증코드)", "IP", "날짜"]
        sql.query('select * from page where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다.';
            res.redirect('/')
          } else {
            sql.query('select * from service1 where status=1 and owner=' + SqlString.escape(req.user.id) + 'ORDER BY num DESC limit 10', function(err, data1){
              sql.query('select * from service1 where status=2 and owner=' + SqlString.escape(req.user.id) + 'ORDER BY num DESC limit 5', function(err, data2){
                sql.query('select * from service1 where owner=' + SqlString.escape(req.user.id), function(err, data3){
                  res.render('manage/data_manager', {rows: rows, data: data, data1: data1, data2: data2, data3: data3, list: list, korean: korean})
                })
              })
            })
          }
        });
      } else if(req.params.service == 2) {
        var data = {
          "name": "정품 인증 사이트",
          "service": 2
        }
        var list = ["nick", "ip", "date"];
        var korean = ["닉네임", "IP", "날짜"];
       sql.query('select * from page where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품 인증 페이지가 존재하지 않습니다.';
            res.redirect('/')
          } else {
            sql.query('select * from service2 where status=1 and owner=' + SqlString.escape(req.user.id) + 'ORDER BY num DESC limit 10', function(err, data1){
              sql.query('select * from service2 where status=2 and owner=' + SqlString.escape(req.user.id) + 'ORDER BY num DESC limit 5', function(err, data2){
                sql.query('select * from service2 where owner=' + SqlString.escape(req.user.id), function(err, data3){
                  res.render('manage/data_manager', {rows: rows, data: data, data1: data1, data2: data2, data3: data3, list: list, korean: korean})
                })
              })
            })
          }
        });
      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
