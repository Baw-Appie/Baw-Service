var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user) {
    sql.query(SqlString.format("SELECT * FROM page WHERE owner=? and service=1", [req.user.id]), function(err, rows){
      sql.query(SqlString.format("SELECT * FROM page WHERE owner=? and service=2", [req.user.id]), function(err, rows2){
        sql.query(SqlString.format("SELECT * FROM page WHERE owner=? and service=3", [req.user.id]), function(err, rows3){
          sql.query(SqlString.format("SELECT * FROM page WHERE owner=? and service=4", [req.user.id]), function(err, rows4){
            if(rows.length != 0){
              var data1 = rows[0]
            }
            if(rows2.length != 0){
              var data2 = rows2[0]
            }
            if(rows3.length != 0){
              var data3 = rows3[0]
            }
            if(rows4.length != 0){
              var data4 = rows4[0]
            }

            res.render('manage/index', {data1: data1, data2: data2, data3: data3, data4: data4});
          })
        })
      })
    })
  } else {
    res.redirect('/auth/login')
  }
}
