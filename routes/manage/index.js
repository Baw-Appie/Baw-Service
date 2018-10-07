var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user) {
    sql.query(SqlString.format("SELECT * FROM pages WHERE owner=?", [req.user.id]), function(err, rows){
      res.render('manage/index', { rows: rows });
    })
  } else {
    res.redirect('/auth/login')
  }
}
