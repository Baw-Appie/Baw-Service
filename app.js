var express = require('express')
var http = require('http');
var https = require('https');
var fs = require('fs');
var sql = require('./config/dbtool');
var pjax = require('./libs/pjax');
var hostname = require('./libs/hostname');
var bodyParser = require('body-parser');
var app = express();
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

app.use( pjax() );
app.use( hostname() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));

app.all('/', function (req, res) {
  res.render('index');
});
app.all('/index2', function (req, res) {
  res.render('error/404');
});

app.post('/login/process', function (req, res) {
  var id = req.body.id;
  var pw = req.body.pass;
  if (id === undefined || pw === undefined || id === "" || pw === ""){
    res.render('error/500')
    console.log('아이디 & 패스워드 없음')
  } else {
    var login_req = sql('select * from id where id="' + id + '" and password=password("' + pw + '")', function(err, rows){
      console.log(rows[0].id);
    });
  }
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

var http_server = http.createServer(app);
var https_server = https.createServer({key: fs.readFileSync('config/ssl/key.pem'), cert: fs.readFileSync('config/ssl/cert.pem')}, app);

http_server.listen(8000, function() {
  console.log('[Baw Service Error Report] server listening on port ' + http_server.address().port);
});
https_server.listen(443, function(){
  console.log("[Baw Service Error Report] SSL server listening on port " + https_server.address().port);
});
