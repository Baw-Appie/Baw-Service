var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
module.exports = async (req, res) => {
  if(req.user) {
    var service = req.params.service
    var datas = [
      {
        name: "후원 사이트",
        service: 1,
        use: (await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))).length == 0 ? false : true
      },
      {
        name: "정품 인증 사이트",
        service: 2,
        use: (await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=2 AND owner=?", [req.user.id]))).length == 0 ? false : true
      },
      {
        name: "서버 상태  사이트",
        service: 3,
        use: (await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=3 AND owner=?", [req.user.id]))).length == 0 ? false : true
      }
    ]
    res.render('manage/create', {datas: datas})
  } else {
    res.redirect('/auth/login')
  }
}
