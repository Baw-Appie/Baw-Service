var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = (req, res) => {
  if(req.user) {
    res.render('api/index')
  } else {
    res.redirect('/auth/login')
  }
}
