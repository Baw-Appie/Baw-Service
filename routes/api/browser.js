var sql = require('../../config/dbtool')
var SqlString = require('sqlstring')

module.exports = (req, res) => {
  if(req.user) {
    var type = req.params.type
    if(type == "add"){
      var token = req.body.token
      if(token){
        sql.query(SqlString.format("INSERT INTO fcm (id, created, token) values(?, NOW(), ?) ON DUPLICATE KEY UPDATE token=VALUES(token)", [req.user.id, token]))
        res.json({ success: true, title: "성공했습니다!", message: "이제 브라우저를 통해서 알림을 수신할 수 있습니다." })
      } else {
        res.json({ success: false, title: "권한이 없습니다.",  message: "정확한 정보가 필요합니다." });
      }
    }
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "부가 서비스 수정 권한이 없습니다." });
  }
}
