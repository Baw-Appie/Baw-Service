var config = require('./dbinfo');
var mysql = require('mysql');

var connection = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  dateStrings: 'date'
});
module.exports = connection
