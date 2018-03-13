var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

app.use('/public', express.static('public'));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('이런! 서버 오류입니다.');
});

app.all('/', function (req, res) {
  res.render('index');
});

server.listen(8000, function() {
  console.log('Baw Service DashBoard(Admin Panel) server listening on port ' + server.address().port);
});

app.use(function(req, res, next) {
  res.status(404).send('이런! 찾고 계신 파일이 없습니다.');
});
