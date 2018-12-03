var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  if(req.body.api_key && req.body.id){
    var { api_key, id } = req.body
    try {
      var donation = await sqlp(sql, SqlString.format("SELECT * FROM api1 WHERE ?", { owner: id, api_key: api_key }))
      var id_check = await sqlp(sql, SqlString.format("SELECT * FROM api2 WHERE ?", { owner: id, api_key: api_key }))
      await sqlp(sql, SqlString.format('delete from api1 WHERE owner=? and api_key=?', [id, api_key]))
      await sqlp(sql, SqlString.format('delete from api2 WHERE owner=? and api_key=?', [id, api_key]))
    } catch {
      return res.send("ERROR")
    }

    var text = ""
    await donation.forEachAsync(async (value, num) => {
      text += api_key + ";" + id + ";" + value['cmd']
      if(value.lnegth == num){
        text += "/"
      }
    })
    await id_check.forEachAsync(async (value, num) => {
      text += api_key + ";" + id + ";" + value['cmd']
      if(value.lnegth == num){
        text += "/"
      }
    })
    
    res.send(text)
  } else {
    res.send("ERROR")
  }
};
