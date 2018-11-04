var send2fa = require('../../libs/send2fa')
var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')
var SqlString = require('SqlString')

module.exports = async (req, res) => {
  if(req.user && req.body.phone && (await sqlp(sql, SqlString.format("SELECT * FROM katalk WHERE id=?", [req.user.id]))).length == 0) {
    try {
      res.json(await send2fa(req.user.id, req.body.phone, req.ip))
    } catch(e) {
      res.json(e)
    }
  }
}
