var express = require('express')
var http = require('http');
var https = require('https');
var fs = require('fs');
var sql = require('./config/dbtool');
var pjax = require('./libs/pjax');
var hostname = require('./libs/hostname');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var session_config = require('./config/session');
var sqlinjection = require('sql-injection');
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;


app.use(sqlinjection);  // add sql-injection middleware here
app.use(session({
 secret: session_config.secret,
 resave: session_config.resave,
 saveUninitialized: session_config.saveUninitialized
}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
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

app.get('/getid', function (req, res) {
  res.send(req.session.user)
})

app.post('/login/process', function (req, res) {
  var id = req.body.id;
  var pw = req.body.pass;
  if (id === undefined || pw === undefined || id === "" || pw === ""){
    res.render('error/500')
    req.session.error = '아이디와 비밀번호를 입력해주세요.';
    res.redirect('https://localhost')
  } else {
    var login_req = sql('select * from id where id="' + id + '" and password=password("' + pw + '")', function(err, rows){
      if (rows.length === 0) {
        req.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
        res.redirect('https://localhost')
      } else {
        req.session.user = rows[0].id;
        req.session.error = rows[0].id + '로 로그인했습니다.';
        res.redirect('https://localhost')
      }
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
