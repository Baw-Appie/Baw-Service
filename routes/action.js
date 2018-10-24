var sql = require('../config/dbtool');
var SqlString = require('sqlstring');

module.exports = (req, res) => {
  if(req.params.code){
    sql.query(SqlString.format('select * from actionmail where code=?', [req.params.code]), function(err, rows){
      if(rows.length == 0){
        res.json({ success: false, message: "알 수 없는 코드"})
      } else {
       if(rows[0]['action'] == "delete_1"){
         sql.query(SqlString.format('delete from service1 where owner=?', [rows[0]['id']]))
         req.session.error = '성공적으로 후원 사이트의 모든 데이터를 삭제했습니다.'
         res.redirect('/')
       }
       if(rows[0]['action'] == "delete_2"){
         sql.query(SqlString.format('delete from service2 where owner=?', [rows[0]['id']]))
         req.session.error ='성공적으로 정품인증 사이트의 모든 데이터를 삭제했습니다.'
         res.redirect('/')
       }
      }
    })
  } else {
    res.json({ success: false, message: "코드 입력 필수"})
  }
}
