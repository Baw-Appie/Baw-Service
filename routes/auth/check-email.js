var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
module.exports = function(req, res){
  if(req.query.key){
    var key = req.query.key
        sql.query(SqlString.format('UPDATE users SET status=1 WHERE json_value(userdata, "$.enc_mail")=?', [key]), function(err, rows){
          if(err) { throw new Error('1번 질의 오류') }
          if(rows.length == 0){
            res.json({ success: false, message: "사용자를 찾지 못했습니다." })
          } else {
            req.session.error = "사용자가 활성화되었습니다."
            res.redirect('/')
          }
        })
  } else {
    res.json({ success: false, message: "키를 전달받지 못했습니다."})
  }
}
