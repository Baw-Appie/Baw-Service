var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  if(req.body.api_key && req.body.id){
    var { api_key, id } = req.body
    try {
      var donation = await sqlp(sql, SqlString.format("SELECT * FROM api1 WHERE ?", [{ owner: id, api_key: api_key }]))
      var id_check = await sqlp(sql, SqlString.format("SELECT * FROM api2 WHERE ?", [{ owner: id, api_key: api_key }]))
      await sqlp(sql, SqlString.format('delete from api1 WHERE owner=? and api_key=?', [id, api_key]))
      await sqlp(sql, SqlString.format('delete from api2 WHERE owner=? and api_key=?', [id, api_key]))
    } catch(e) {
      return res.send("ERROR")
    }

    var text = ""
    await donation.forEachAsync(async (value, num) => {
      text += api_key + ";" + id + ";" + value['cmd']
      // 후원 처리 마지막꺼 아니거나 정품인증 있으면
      if(donation.length != num || id_check.length != 0){
        text += "/"
      }
    })
    await id_check.forEachAsync(async (value, num) => {
      text += api_key + ";" + id + ";" + value['cmd']
      if(id_check.length != num){
        text += "/"
      }
    })

    res.send(text)
  } else {
    res.send("ERROR")
  }
};
