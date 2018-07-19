var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      sql.query('select * from users where id=' + SqlString.escape(req.user.id), function(err, rows){
        var jsondata = JSON.parse(rows[0]['userdata'])
        res.render('my/view', {rows: rows, jsondata: jsondata})
      });
    } else {
      res.redirect('/auth/login')
    }
};
