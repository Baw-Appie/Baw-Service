var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var SqlString = require('sqlstring');
var vali = require('validator');

module.exports = function(req, res){
  if(req.user){
    // sql(SqlString.format('SELECT * from page WHERE service=1 AND owner=?', [req.user.id]), function(err, sv1){
    //   // TODO: ERR 오류 처리
    //   if(sv1.length == 1){
    //     sql(SqlString.format('SELECT * from service1 WHERE owner=? AND status=1', [req.user.id]), function(err, a1){
    //       // TODO: ERR 오류 처리
    //       var a1_data = 0
    //       var temp = 0
    //       var a1_counter = a1.length
    //       a1.forEach(function(item) {
    //         temp = Number(item['bal'].replace(/,/gi, ""))
    //         if(!isNaN(temp)){
    //           console.log(temp)
    //           a1_data += temp
    //         } else {
    //           console.log("NaN 발견")
    //         }
    //         a1_counter -= 1;
    //         if ( a1_counter === 0){
    //           console.log("A1_DATA - " + a1_data)
    //         }
    //       })
    //     })
    //   }
    // })



    res.render('index')
  } else {
    res.render('index_nologin')
  }
}
