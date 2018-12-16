var sql = require("./config/dbtool")
var sqlp = require("./libs/sql-promise")
var SqlString = require("SqlString")

Array.prototype.forEachAsync = async function(cb){
  var no = 0
  for(let x of this){
    await cb(x, no);
    no++
  }
};

(async () => {
  var data1 = await sqlp(sql, "SELECT * FROM service1")
  data1.forEach((item) => {
    console.log(item.num+" 이전중 1111")
    var a = {
      // bal, pin, method, nname, bouns, code
      bal: item.bal,
      pin: item.pin,
      method: item.method,
      code: item.code,
      nname: item.nname,
      bouns: item.bouns
    }
    sql.query(SqlString.format("INSERT INTO service values(NULL, ?, ?, 1, ?, ?, ?, ?, ?)", [item.page, item.owner, item.nick, item.date, item.ip, item.status, JSON.stringify(a)]))
  })
  var data2 = await sqlp(sql, "SELECT * FROM service2")
  data2.forEach((item) => {
    console.log(item.num+" 이전중 22222")
    sql.query(SqlString.format("INSERT INTO service values(NULL, ?, ?, 2, ?, ?, ?, ?, '{}')", [item.page, item.owner, item.nick, item.date, item.ip, item.status]))
  })
})()
