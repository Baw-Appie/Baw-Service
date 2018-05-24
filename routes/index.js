var sql = require('../config/dbtool');
var getdata = require('../libs/getdata');
var SqlString = require('sqlstring');
var Feed = require('rss-to-json');

module.exports = function(req, res){
  Feed.load('https://baw-service.tistory.com/feed', function(err, rss){
    if(req.user){
      getdata(req).then(function (text) {
        var obj = Object.assign(text, rss);
        res.render('index', text)
      })
    } else {
      res.render('index_nologin', rss)
    }
  });
}
