var sql = require('../config/dbtool');
var getdata = require('../libs/getdata');
var SqlString = require('sqlstring');

module.exports = function(req, res){
  sql.query("SELECT * from `id`", function(err, rows){
	  console.log(rows)
  })
  res.send("HELLO")
}
