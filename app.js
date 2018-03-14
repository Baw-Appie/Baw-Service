var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
app.set('view engine', 'jade');
app.set('views', './views');
//app.locals.pretty = true;

app.use('/public', express.static('public'));

app.all('/', function (req, res) {
  res.render('index', {hostname: req.hostname});
});

app.use(function(req, res, next) {
  res.status(404);
  res.render('error/404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('error/500')
});



server.listen(8000, function() {
  console.log('Baw Service DashBoard(Admin Panel) server listening on port ' + server.address().port);
});
