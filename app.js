var express = require('express')
var http = require('http');
var https = require('https');
var fs = require('fs');
var server_settings = require('./config/server_settings');
var sql = require('./config/dbtool');
var pjax = require('./libs/pjax');
var hostname = require('./libs/hostname');
var allow_ip = require('./libs/allow_ip');
var socket_api = require('./libs/socket_api');
var bodyParser = require('body-parser');
var app = express();
var cookieSession = require('cookie-session')
var session_config = require('./config/session');
var SqlString = require('sqlstring');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

app.use(cookieSession({
  name: 'session',
  keys: [session_config.secret],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});
app.use( pjax() );
app.use( hostname() );
app.use( allow_ip() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));


app.all('/', function (req, res) {
  res.render('index');
});

app.get('/manage', function (req, res) {
  if(req.user.id) {
    res.render('manage/index');
  } else {
    res.redirect('/auth/login')
  }
});
app.get('/manage/:service/view', require('./routes/manage/view'));
app.all('/manage/:service/complete/:id/:status', require('./routes/manage/complete'))
app.post('/manage/:service/edit', require('./routes/manage/edit_complete'))
app.get('/manage/:service/edit', require('./routes/manage/edit_view'))

app.post('/api/:service/edit', require('./routes/api/edit_complete'))
app.get('/api/:service/edit', require('./routes/api/edit_view'))

app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
app.get('/auth/login', function(req, res){
  res.render('login');
})
app.post('/auth/login', passport.authenticate('local', {failureRedirect: '/auth/login', failureFlash: false}), function (req, res) {
    res.redirect('/');
  });

passport.serializeUser(function (user, done) {
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pass',
  session: true,
  passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
}, function (req, username, password, done) {
    var login_req = sql('select * from id where id=' + SqlString.escape(username) + ' and password=password(' + SqlString.escape(password) + ')', function(err, rows){
      if(err) { done(err) };
      if (rows.length === 0) {
        req.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
        return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
      } else {
        req.session.error = rows[0].id + '로 로그인했습니다.';
        return done(null, {
          'id': username,
        });
      }
    });
}));


app.use(function(req, res, next) {
  res.status(404);
  res.render('error/404');
});

app.use(function(err, req, res, next) {
  console.error('[Baw Service Error Report] 처리할 수 없는 문제로 500 에러가 사용자에게 출력되고 있습니다.' + err.stack);
  res.status(500);
  res.render('error/500')
});

var http_server = http.createServer(app);
var https_server = https.createServer({key: fs.readFileSync('config/ssl/key.pem'), cert: fs.readFileSync('config/ssl/cert.pem')}, app);

http_server.listen(server_settings.http_port, function() {
  console.log('[Baw Service Error Report] server listening on port ' + http_server.address().port);
});
https_server.listen(server_settings.https_port, function(){
  console.log("[Baw Service Error Report] SSL server listening on port " + https_server.address().port);
});
