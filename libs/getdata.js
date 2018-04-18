var sql = require('../config/dbtool');
var SqlString = require('sqlstring');

function countdata(variable, option, regex){
  var i = 0
  var data = 0
  while ( i < variable.length ) {
    temp = Number(variable[i][option].replace(regex, ""))
    if(!isNaN(temp)){
      data += temp
    }
    i++
  }
  return data
}
function donation(req){
  return new Promise(function (resolve, reject) {
    sql(SqlString.format('SELECT * from page WHERE service=1 AND owner=?', [req.user.id]), function(err, sv1){
      if(sv1.length == 1){
        sql(SqlString.format('SELECT * from service1 WHERE owner=? AND status=1', [req.user.id]), function(err, a1){
          var a1_data = countdata(a1, 'bal', /,/gi)
          sql(SqlString.format('SELECT * from service1 WHERE owner=? AND status=1 AND date > DATE_ADD(now(), INTERVAL -1 month)', [req.user.id]), function(err, a2){
            var a2_data = countdata(a2, 'bal', /,/gi)
            sql(SqlString.format('SELECT * from service1 WHERE owner=? AND status=2', [req.user.id]), function(err, a3){
              var a3_data = a3.length
              resolve([a1_data, a2_data, a3_data])
            })
          })
        })
      } else {
        resolve([0, 0, 0])
      }
    })
  })
}
function idcheck(req){
  return new Promise(function (resolve, reject) {
    sql(SqlString.format('SELECT * from page WHERE service=2 AND owner=?', [req.user.id]), function(err, sv2){
      if(sv2.length == 1){
        sql(SqlString.format('SELECT * from service2 WHERE owner=? AND status=1', [req.user.id]), function(err, a4){
          var a4_data = a4.length
          resolve(a4_data)
        })
      } else {
        resolve(0)
      }
    })
  })
}
module.exports = function(req) {
  return new Promise(function (resolve, reject) {
    donation(req).then(function (text) {
      idcheck(req).then(function (text2) {
        var data = {a1: text[0], a2: text[1], a3: text[2]}
        data['a4'] = text2
        resolve(data)
      })
    })
  })
}
