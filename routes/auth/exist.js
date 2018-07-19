var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
module.exports = function(req, res){
  if(req.params.type && req.body.data){
    var type = req.params.type
    if(type == "id"){
      var sql_Request = SqlString.format('SELECT * FROM users WHERE id=?', [req.body.data])
    }
    if(type == "mail"){
      var sql_Request = SqlString.format('SELECT * FROM users WHERE mail=?', [req.body.data])
    }
    if(type == "page"){
      var sql_Request = SqlString.format('SELECT * FROM pages WHERE name=?', [req.body.data])
    }
    sql.query(sql_Request, function(err, rows){
      if(err){ throw new Error('1번 질의 오류') }
      if(rows.length == 0){
        if(type == "mail"){
          if(validator.isEmail(req.body.data) == true){
            res.json({ success: true, message: "사용 가능합니다." })
          } else {
            res.json({ success: false, message: "잘못된 이메일 형식입니다." })
          }
        } else {
          res.json({ success: true, message: "사용 가능합니다." })
        }
      } else {
        res.json({ success: false, message: "이미 사용중입니다." })
      }
    })
  }
}
