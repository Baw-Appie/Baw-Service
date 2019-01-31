var sql = require('../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('./sql-promise')

function countdata(variable, option, regex, json){
  var i = 0
  var data = 0
  while ( i < variable.length ) {
    if(json) {
      temp = Number(JSON.parse(variable[i]['extradata'])[option].replace(regex, ""))
    } else {
      temp = Number(variable[i][option].replace(regex, ""))
    }
    if(!isNaN(temp)){
      data += temp
    }
    i++
  }
  return data
}

module.exports = async (req) => {
  if((await sqlp(sql, SqlString.format('SELECT * from pages WHERE service=1 AND owner=?', [req.user.id]))).length == 1){
    var a1_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1', [req.user.id])), 'bal', /,/gi, true)
    var a2_data = countdata(await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=1 AND date > DATE_ADD(now(), INTERVAL -1 month)', [req.user.id])), 'bal', /,/gi, true)
    var a3_data = (await sqlp(sql, SqlString.format('SELECT * from service WHERE service=1 AND owner=? AND status=2', [req.user.id]))).length
    var c1_req = await sqlp(sql, SqlString.format('SELECT date, extradata from service WHERE service=1 AND owner=? AND status=1 AND `date` BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) AND CURDATE();', [req.user.id]))
    var c1_data = []
    await c1_req.forEachAsync(async (value) => {
      c1_data.push({date: value.date, extradata: JSON.parse(value.extradata)})
    })
    c1_data = JSON.stringify(c1_data)
  } else {
    var a1_data = 0
    var a2_data = 0
    var a3_data = 0
    var c1_data = '[]'
  }
  if((await sqlp(sql, SqlString.format('SELECT * from pages WHERE service=2 AND owner=?', [req.user.id]))).length == 1){
    var a4_data = (await sqlp(sql, SqlString.format('SELECT * from service WHERE service=2 AND owner=? AND status=1', [req.user.id]))).length
  } else {
    var a4_data = 0
  }
  return {a1: a1_data, a2: a2_data, a3: a3_data, a4: a4_data, c1: c1_data}
}
