var getdata = require('../libs/getdata');
var Feed = require('rss-to-json');

module.exports = async (req, res) => {
  Feed.load('https://baw-service.tistory.com/feed', function(err, rss){
    if(req.user){
      var text = await getdata(req)
      Object.assign(text, rss)
      res.render('index', text)
    } else {
      res.render('index_nologin', rss)
    }
  });
}
