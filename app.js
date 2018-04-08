// 모듈 로드
var express = require('express')
var http = require('http');
var https = require('https');
var fs = require('fs');
var server_settings = require('./config/server_settings');
var sql = require('./config/dbtool');
var bodyParser = require('body-parser');
var app = express();
var cookieSession = require('cookie-session')
var session_config = require('./config/session');
var SqlString = require('sqlstring');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
app.set('view engine', 'jade');
app.set('views', './views');
if(server_settings.pretty_html == true) {
  app.locals.pretty = true;
}
// 서버 초기화
app.use(function(req,res,next){
  if (req.hostname == server_settings.hostname || fs.existsSync('./config/ssl/'+req.hostname+'/key.pem')) {
    if (!req.secure) {
      return res.redirect('https://' + req.get('host') + req.url);
    }
  }
  next();
});
app.use(cookieSession({
  name: 'session',
  keys: [session_config.secret],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.session = req.session;
    res.set("Access-Control-Allow-Origin", '*');
    res.locals.user = req.user;
    next();
});
app.use( require('./libs/pjax')() );
app.use( require('./libs/hostname')() );
app.use( require('./libs/allow_ip')() );
app.use( require('./libs/custom_domains')() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));

// *페이지 라우터* //
// 메인
app.all('/', function (req, res) {
  res.render('index');
});

// 페이지 관리
app.get('/manage', function (req, res) {
  if(req.user) {
    res.render('manage/index');
  } else {
    res.redirect('/auth/login')
  }
});
app.get('/manage/:service/view', require('./routes/manage/view'));
app.all('/manage/:service/complete/:id/:status', require('./routes/manage/complete'))
app.post('/manage/:service/edit', require('./routes/manage/edit_complete'))
app.get('/manage/:service/edit', require('./routes/manage/edit_view'))

// API 관리
app.post('/api/:service/edit', require('./routes/api/edit_complete'))
app.get('/api/:service/edit', require('./routes/api/edit_view'))

// API 요청 처리
app.all('/api/serveripcheck.php', function(req,res) {
  res.send(server_settings.server_ip)
})
app.all('/api/versionchecker.php', function(req,res) {
  res.send("0.11-Alpha")
})
app.all('/api/versioncheckerHTTP.php', function(req,res) {
  res.send("0.2")
})
app.all('/api/getlist.php', require('./routes/api/getlist'))

// 유저 활동 처리
app.post('/user/donation', require('./routes/user/donation_complete'))
app.post('/user/id_check', require('./routes/user/id_check_complete'))

// 서버 아이콘 셋팅
app.get('/favicon.ico', function(req, res){
  res.download('./public/img/favicon.ico');
});

// *인증 With PassportJS* //
// 로그아웃
app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
// 로컬 로그인
app.get('/auth/login', function(req, res){
  res.render('login');
})
// 로컬 로그인 시도
app.post('/auth/login', passport.authenticate('local', {failureRedirect: '/auth/login', failureFlash: false}), function (req, res) {
    res.redirect('/');
});
// 로컬 회원가입
app.get('/auth/register', function(req, res){
  res.render('auth/register')
})
// 로컬 회원가입을 위한 ID / Mail 중복 검사
app.post('/auth/exist/:type', require('./routes/auth/exist'))
// 로컬 회원가입 시도
app.post('/auth/register', require('./routes/auth/register'))
// Google 로그인
app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'https://www.googleapis.com/auth/plus.login',
  	  'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));
// Google 로그인 시도
app.get( '/auth/google/callback',
	passport.authenticate( 'google', {
		successRedirect: '/',
		failureRedirect: '/auth/login'
}));
// Kakao 로그인
app.get('/auth/kakao', passport.authenticate('kakao',{
    failureRedirect: '/auth/login'
}));
// Kakao 로그인 시도
app.get( '/auth/kakao/callback',
  	passport.authenticate( 'kakao', {
  		successRedirect: '/',
  		failureRedirect: '/auth/login'
}));
// *인증 With PassportJS* //
// *페이지 라우터* //


// *PassportJS* //

// 유저 정보 설정
passport.serializeUser(function (user, done) {
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// 로컬 로그인
passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pass',
  session: true,
  passReqToCallback: true
}, require('./libs/passport/local')));

// *소셜 로그인 //
// Google 로그인
var oauth_info = require('./config/oauth_info');
passport.use(new GoogleStrategy({
    clientID: oauth_info.googleid,
    clientSecret: oauth_info.googlesecret,
    callbackURL: "https://"+server_settings.hostname+"/auth/google/callback",
    passReqToCallback: true
  },
  require('./libs/passport/google')
));
// Kakao 로그인
passport.use(new KakaoStrategy({
    clientID: oauth_info.kakaoid,
    clientSecret: oauth_info.kakaosecret,
    callbackURL: "https://"+server_settings.hostname+"/auth/kakao/callback",
    passReqToCallback: true
  },
  require('./libs/passport/kakao')
));
// *PassportJS* //

// 유저 페이지 로드 및 404 서버 에러 처리
app.use(require('./routes/userpage-with-404'));

// 500 서버 에러 처리
app.use(function(err, req, res, next) {
  console.error('[Baw Service Error Report] 처리할 수 없는 문제로 500 에러가 사용자에게 출력되고 있습니다.', err.stack);
  res.status(500).render('error/500')
});

// *서버 초기화* //
var http_server = http.createServer(app);

var tls = require('tls');
// Baw Service 인증을 위한 SSL 자동 적용
var ssloptions = {
    SNICallback: function (domain, cb) {
        if (fs.existsSync('./config/ssl/'+domain+'/key.pem')) {
            if (cb) {
                cb(null, tls.createSecureContext({
                  key: fs.readFileSync('./config/ssl/'+domain+'/key.pem', 'utf8'),
                  cert: fs.readFileSync('./config/ssl/'+domain+'/cert.pem', 'utf8')
                }));
            } else {
              return tls.createSecureContext({
                key: fs.readFileSync('./config/ssl/'+domain+'/key.pem', 'utf8'),
                cert: fs.readFileSync('./config/ssl/'+domain+'/cert.pem', 'utf8')
              })
            }
        } else {
          if (cb) {
            cb(null, tls.createSecureContext({
              key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
              cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
            }));
          } else {
            return tls.createSecureContext({
              key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
              cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
            })
          }
        }
    },
   key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
   cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
}
var https_server = https.createServer(ssloptions, app);
// *서버 초기화* //

// 서버 실행
http_server.listen(server_settings.http_port, function() {
  console.log('[Baw Service Error Report] server listening on port ' + http_server.address().port);
});
https_server.listen(server_settings.https_port, function(){
  console.log("[Baw Service Error Report] SSL server listening on port " + https_server.address().port);
});
