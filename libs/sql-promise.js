var ss = require('../config/server_settings')
var sql = require('../config/dbtool')
var rp = require('request-promise')
var SqlString = require('SqlString')
var vali = require('validator')

module.exports = (connection, sql) => {
  return new Promise(function(resolve,reject){
     connection.query(sql, function(err, rows){
         if(err !== null) return reject(err);
         resolve(rows);
     });
  });
}
