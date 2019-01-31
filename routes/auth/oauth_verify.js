var sqlp = require('../../libs/sql-promise')
var sql = require('../../config/dbtool')
var SqlString = require("sqlstring")

module.exports = async (req, res) => {
  var { client_id="", secret="", token="" } = req.body
  if(client_id == "" || secret == "" || token == "") {
    return res.json({ success: false, message: "필수 정보가 누락되었습니다." })
  }
  var app = await sqlp(sql, SqlString.format("SELECT * FROM app WHERE client_id=? AND secret=?", [client_id, secret]))
  if(app.length != 1) {
    return res.json({ success: false, message: "알 수 없는 서비스 정보입니다. 아직 제대로 서비스가 연결되지 않았거나, Baw Service에서 앱 등록을 검토중일 수 있습니다." })
  }
  var data = await sqlp(sql, SqlString.format("SELECT * FROM id_token WHERE app=? AND token=?", [app[0].client_id, token]))
  if(data.length != 1) {
    return res.json({ success: false, message: "토큰이 잘못되었습니다." })
  }
  var finaldata = (await sqlp(sql, SqlString.format("SELECT id, mail, status FROM users WHERE id=?", [data[0].id])))[0]
  finaldata['svname'] = JSON.parse((await sqlp(sql, SqlString.format("SELECT userdata FROM users WHERE id=?", [data[0].id])))[0]['userdata'])['svname']

  return res.json({ success: true, data: finaldata })
}
