var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var SqlString = require('sqlstring');
module.exports = function() {
    return function custom_domains( req, res, next ) {
      if(req.path == "/" && req.hostname != server_settings.hostname) {
        var sql_req = sql.query('SELECT * FROM custom_domain WHERE domain='+SqlString.escape(req.hostname), function(err, rows){
          if(err) { throw new Error('1번 질의 오류') }
          if(rows.length == 1){
            var url = rows[0]['go']
            res.render('user_page/custom_domain', {url: url, hostname: server_settings.hostname})
          } else {
            next();
          }
        })
      } else {
        next();
      }
    };
};
