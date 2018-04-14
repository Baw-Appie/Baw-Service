var sql = require('../../config/dbtool');
var send2fa = require('../../libs/send2fa');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user || req.body.phone) {
    send2fa(req.user.id, req.body.phone, req.connection.remoteAddress).then(function (text) {
    	res.json(text)
    }).catch(function (error) {
    	res.json(error)
    });
  }
}
