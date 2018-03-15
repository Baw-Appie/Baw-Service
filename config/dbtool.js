var config = require('./dbinfo');
module.exports = function(sql) {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  });
  connection.connect();
  connection.query(sql, function(err, rows, fields) {
    if (!err)
      return rows;
    else
      console.log('[Baw Service Error Report] Error while performing Query.', err);
  });
  connection.end();
}
