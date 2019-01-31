var server_settings = require('../../config/server_settings')
var sqlp = require('../../libs/sql-promise')
var sql = require('../../config/dbtool')
var SqlString = require("sqlstring")

module.exports = async (req, res) => {
  function token() {
    return new Promise(function(resolve, reject) {
      require('crypto').randomBytes(48, function(err, buffer) {
        if(err) reject(err)
        resolve(buffer.toString('hex'))
      })
    })
  }
  var { client_id="", redirect="", approved="" } = req.query

  if(client_id == "" || redirect == "") {
    return res.json({ success: false, message: "필수 정보가 누락되었습니다." })
  }
  var data = await sqlp(sql, SqlString.format("SELECT * FROM app WHERE client_id=?", [client_id]))
  if(data.length != 1) {
    return res.json({ success: false, message: "알 수 없는 서비스 정보입니다. 아직 제대로 서비스가 연결되지 않았거나, Baw Service에서 앱 등록을 검토중일 수 있습니다." })
  }
  if(!req.user) {
    req.session.redirect = `/auth/oauth?client_id=${client_id}&redirect=${redirect}`
    return res.render('auth/oauth_login', {data: data[0]})
  }
  if(approved != "" && req.header('Referer')) {
    var url = require('url');
    var parsedObject = url.parse(req.header('Referer'));
    if(parsedObject.hostname != server_settings.hostname) {
      return res.json({ success: false, message: "보안 위협이 감지되어 요청을 완료할 수 없습니다." })
    }
    var token = await token()
    await sqlp(sql, SqlString.format("INSERT INTO id_token values (NULL, ?, ?, ?, NOW() + INTERVAL 5 MINUTE)", [client_id, req.user.id, token]))
    return res.redirect(redirect+"?success=true&token="+token)
  }

  return res.render('auth/oauth', {data: data[0], redirect, client_id})
}
