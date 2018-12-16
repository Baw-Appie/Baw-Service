var sql = require('../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('./sql-promise')

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

module.exports = async (req) => {
  if((await sqlp(sql, SqlString.format('SELECT * from pages WHERE service=1 AND owner=?', [req.user.id]))).length == 1){
    var a1_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1', [req.user.id])), 'bal', /,/gi)
    var a2_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1 AND date > DATE_ADD(now(), INTERVAL -1 month)', [req.user.id])), 'bal', /,/gi)
    var a3_data = (await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=2', [req.user.id]))).length
    var c1_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1 AND `date` BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL DAYOFMONTH(CURRENT_DATE)-1 DAY)  AND LAST_DAY(CURDATE());', [req.user.id])), 'bal', /,/gi)
    var c2_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1 AND `date` BETWEEN date(CURRENT_DATE - interval 1 MONTH) - interval day(now()) day + interval 1 day AND LAST_DAY(CURRENT_DATE - interval 1 MONTH);', [req.user.id])), 'bal', /,/gi)
    var c3_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1 AND `date` BETWEEN date(CURRENT_DATE - interval 2 MONTH) - interval day(now()) day + interval 1 day AND LAST_DAY(CURRENT_DATE - interval 2 MONTH);', [req.user.id])), 'bal', /,/gi)
  } else {
    var a1_data = 0
    var a2_data = 0
    var a3_data = 0
    var c1_data = 0
    var c2_data = 0
    var c3_data = 0
  }
  if((await sqlp(sql, SqlString.format('SELECT * from pages WHERE service=2 AND owner=?', [req.user.id]))).length == 1){
    var a4_data = (await sqlp(sql, SqlString.format('SELECT * from service WHERE service=2 AND owner=? AND status=1', [req.user.id]))).length
  } else {
    var a4_data = 0
  }
  return {a1: a1_data, a2: a2_data, a3: a3_data, a4: a4_data, c1: c1_data, c2: c2_data, c3: c3_data}
}
