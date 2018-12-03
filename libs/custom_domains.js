var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var SqlString = require('sqlstring');
var sqlp = require('../libs/sql-promise')

module.exports = async (req, res, next) => {
  if(req.path == "/" && req.hostname != server_settings.hostname) {
    var data = await sqlp(sql, SqlString.format("SELECT * FROM custom_domain WHERE ?", [{domain: req.hostname}]))
    if(data.length == 1){
      return require('./userpage-with-404')(req, res, next, data[0]['go'])
      // return require('../routes/userpage=with-404')(req, res, next, data[0]['go'])
      // return res.render('user_page/custom_domain', {url: data[0]['go'], hostname: server_settings.hostname})
    }
  }
  next()
}
