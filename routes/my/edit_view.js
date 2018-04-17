var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      var sql_req = sql('select * from id where id=' + SqlString.escape(req.user.id), function(err, rows){
        res.render('my/view', {rows: rows})
      });
    } else {
      res.redirect('/auth/login')
    }
};
