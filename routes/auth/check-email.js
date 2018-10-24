var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
module.exports = async (req, res) => {
  var key = req.query.key
  if(key){
    var data = await sqlp(sql, SqlString.format('UPDATE users SET status=1 WHERE json_value(userdata, "$.enc_mail")=?', [key]))
    if(data.changedRows == 0) {
      return res.json({ success: false, message: "사용자를 찾지 못했습니다." })
    } else {
      req.session.error = "사용자가 활성화되었습니다."
      return res.redirect('/')
    }
  } else {
    res.json({ success: false, message: "데이터가 부족합니다."})
  }
}
