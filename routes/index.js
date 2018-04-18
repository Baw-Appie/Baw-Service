var sql = require('../config/dbtool');
var getdata = require('../libs/getdata');
var SqlString = require('sqlstring');

module.exports = function(req, res){
  if(req.user){
    getdata(req).then(function (text) {
      res.render('index', text)
    })


  } else {
    res.render('index_nologin')
  }
}
