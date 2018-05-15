var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
module.exports = function(req, res){
  if(req.query.key){
    var key = req.query.key
    var sql_Request = SqlString.format('SELECT * FROM id WHERE enc_mail=? AND status=0', [key])
    var sql_req = sql.query(sql_Request, function(err, rows){
      if(err){ throw new Error('1번 질의 오류') }
      if(rows.length == 0){
        sql.query(SqlString.format('UPDATE id SET status=1 WHERE enc_mail=?', [key]), function(err, rows){
          if(err) { throw new Error('2번 질의 오류') }
          // res.json({ success: true, message: "사용자가 활성화되었습니다." })
          req.session.error = "사용자가 활성화되었습니다."
          res.redirect('/')
        })
      } else {
        res.json({ success: false, message: "사용자를 찾지 못했습니다." })
      }
    })
  } else {
    res.json({ success: false, message: "키를 전달받지 못했습니다."})
  }
}
