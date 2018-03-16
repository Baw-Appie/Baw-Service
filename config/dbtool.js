var config = require('./dbinfo');
module.exports = function(sql, callback) {
  var data;
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  });
  connection.connect();
  connection.query(sql, callback);
  connection.end();
}
