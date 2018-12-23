var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  var type = req.params.type
  var data = req.body.data
  if(type && data){
    switch(type) {
      case "id":
        var sql_Request = SqlString.format('SELECT * FROM users WHERE id=?', [data])
        break
      case "mail":
        if (!validator.isEmail(data)) {
          return res.json({ success: false, message: "잘못된 이메일 형식입니다." })
        }
        var sql_Request = SqlString.format('SELECT * FROM users WHERE mail=?', [data])
        break
      case "page":
        var sql_Request = SqlString.format('SELECT * FROM pages WHERE name=?', [data])
        break
    }
    try { var data = await sqlp(sql, sql_Request) } catch(e) { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
    if(data.length == 0) {
      return res.json({ success: true, message: "사용 가능합니다." })
    } else {
      return res.json({ success: false, message: "이미 사용중입니다." })
    }
  }
}
