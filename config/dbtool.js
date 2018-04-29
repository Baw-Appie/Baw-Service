var config = require('./dbinfo');
var data;
var mysql      = require('mysql');
var connection = mysql.createPool({
host: config.host,
port: config.port,
user: config.user,
password: config.password,
database: config.database,
dateStrings: 'date'
});
module.exports = connection
  // connection.connect();
  // connection.query(sql, callback);
  // connection.end();
