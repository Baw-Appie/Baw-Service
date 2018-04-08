var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.body.api_key && req.body.id){
    var api_key = req.body.api_key
    var id = req.body.id
    sql(SqlString.format('SELECT * FROM api1 WHERE owner=? and api_key=?', [id, api_key]), function(err, rows){
      if(err){ throw new Error('1번 질의 오류') }
      sql(SqlString.format('SELECT * FROM api2 WHERE owner=? and api_key=?', [id, api_key]), function(err, rows2){
        if(err){ throw new Error('2번 질의 오류') }
        var rcount = rows.length + rows2.length

        var no = 0
        var text = ""
        rows.forEach(function(item) {
          no++
          var text = text+api_key+";"+id+";"+item['cmd']
          if(no != rcount){
            var text = text+"'/"
          }
        })
        rows2.forEach(function(item) {
          no++
          var text = text+api_key+";"+id+";"+item['cmd']
          if(no != rcount){
            var text = text+"'/"
          }
        })

        sql(SqlString.format('delete from api1 WHERE owner=? and api_key=?', [id, api_key]))
        sql(SqlString.format('delete from api2 WHERE owner=? and api_key=?', [id, api_key]))

      })
    })
  } else {
    res.send("ERROR")
  }
};
