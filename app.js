// 모듈 로드
var express = require('express')
var http = require('http');
var https = require('spdy');
var fs = require('fs');
var server_settings = require('./config/server_settings');
var sql = require('./config/dbtool');
var bodyParser = require('body-parser');
var app = express();
var cookieSession = require('cookie-session')
var session_config = require('./config/session');
var oauth_info = require('./config/oauth_info');
var SqlString = require('sqlstring');
var compression = require('compression')
var RateLimit = require('express-rate-limit');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var Raven = require('raven');

var version = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim()

console.log("[Baw Service Server] Baw Service "+version+" Starting..")
if(server_settings.sentry_error == true){
  Raven.config(server_settings.sentry, { release: version }).install();
}

app.set('view engine', 'pug');
app.set('views', './views');
app.set('trust proxy', function (ip) {
  if (ip === '127.0.0.1')
  return true;
  else return false;
});

// 서버 초기화
if(server_settings.pretty_html == true) {
  app.locals.pretty = true;
}
if(server_settings.sentry_error == true){
  app.use(Raven.requestHandler());
}
app.use(compression())
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
    res.removeHeader("x-powered-by");
    res.locals.session = req.session;
    res.set("Access-Control-Allow-Origin", '*');
    res.locals.user = req.user;
    res.locals.ad = server_settings.ad;
    res.locals.server_settings = server_settings;
    res.locals.oauth_info = oauth_info;
    var useragent = require('useragent');
    res.locals.browser = useragent.lookup(req.headers['user-agent']).family;
    next();
});
app.use( require('./libs/logging') );
app.use( require('./libs/pjax')() );
app.use( require('./libs/hostname')() );
app.use( require('./libs/allow_ip')() );
app.use( require('./libs/custom_domains')() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));
app.use('/.well-known', express.static('.well-known'));

// *페이지 라우터* //
// 메인
app.all('/', require('./routes/index'));
app.all('/UnsupportedBrowser', (req, res) => { res.render('./UnsupportedBrowser') });

// *보안* //
// 카카오톡 활성화 요청
app.get('/secuity/allow_katalk', function (req, res) {
  if(req.user) {
    res.render('secuity/allow_katalk')
  } else {
    res.redirect('/auth/login')
  }
})
// 카카오톡 활성화 요청 처리
app.post('/secuity/allow_katalk', require('./routes/secuity/complete_allow_katalk'))
// 이중인증 카톡 메시지 발송
app.post('/secuity/req_code', require('./routes/secuity/req_code'))
// *보안* //

// *개인설정* //
app.get('/my', require('./routes/my/edit_view'))
app.post('/my', require('./routes/my/edit_complete'))
app.post('/my/pass', require('./routes/my/pass_complete'))
// *개인설정* //

app.get('/action/:code', require('./routes/action'))

// 페이지 관리
app.get('/manage', require('./routes/manage/list_view'));
app.get('/manage/:service/view', require('./routes/manage/view'));
app.all('/manage/:service/complete/:id/:status', require('./routes/manage/complete'))
app.post('/manage/:service/edit', require('./routes/manage/edit_complete'))
app.get('/manage/:service/edit', require('./routes/manage/edit_view'))
app.get('/manage/:service/data_export_excel', require('./routes/manage/data_export_excel'))
app.post('/manage/:service/data_add', require('./routes/manage/data_add'))
app.get('/manage/:service/data_manager', require('./routes/manage/data_manager'))
app.post('/manage/:service/data_delete', require('./routes/manage/data_delete'))
app.post('/manage/:service/create', require('./routes/manage/create_complete'))
app.get('/manage/:service/create', require('./routes/manage/create_view'))
app.post('/manage/:service/lookup', require('./routes/manage/lookup'))

// API 관리
app.post('/api/:service/edit', require('./routes/api/edit_complete'))
app.get('/api/:service/edit', require('./routes/api/edit_view'))

// API 요청 처리
app.all(['/api/serveripcheck.php', '/API/GetServerIP'], function(req,res) {
  res.send(server_settings.server_ip)
})
app.all(['/api/versionchecker.php', '/API/GetAPIVersion'], function(req,res) {
  res.send("1.0")
})
app.all(['/api/versioncheckerHTTP.php', '/API/GetHTTPAPIVersion'], function(req,res) {
  res.send("1.0")
})
app.all(['/api/getlist.php', '/API/GetList'], require('./routes/api/getlist'))

// 유저 활동 처리
app.post('/user/donation', require('./routes/user/donation_complete'))
app.post('/user/id_check', require('./routes/user/id_check_complete'))

// 서버 아이콘 셋팅
app.get('/favicon.ico', function(req, res){
  res.download('./public/img/favicon.ico');
});

// *인증 With PassportJS* //
// 계정 전환
app.get('/auth/change', function(req, res){
  res.render('auth/change')
});
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
var LoginLimiter = new RateLimit({
  windowMs: 20*60*1000,
  delayMs: 0,
  max: 10,
  message: "너무 많은 로그인 시도가 감지되었습니다. 잠시 후 다시 시도하세요."
});
app.post('/auth/login', LoginLimiter, passport.authenticate('local', {failureRedirect: '/auth/login', failureFlash: false}), function (req, res) {
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
// 로컬 회원가입 이메일 인증
app.get('/auth/check-email', require('./routes/auth/check-email'))
// Google 로그인
app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'email' ] }
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
if(server_settings.sentry_error == true){
  app.use(Raven.errorHandler());
}
app.use(function(err, req, res, next) {
  console.error('[Error] 처리할 수 없는 문제로 500 에러가 사용자에게 출력되고 있습니다. '+err.message);
  res.status(500)
  if(server_settings.sentry_error == true) {
    if( req.header( 'X-PJAX' ) ) {
        res.json({ sentry: res.sentry, dsn: server_settings.sentry })
    } else {
      res.render('error/500', { sentry: res.sentry })
    }
  } else {
    res.render('error/500')
  }
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
                  cert: fs.readFileSync('./config/ssl/'+domain+'/cert.pem', 'utf8'),
                  ca: fs.readFileSync('./config/ssl/'+domain+'/ca.pem', 'utf8')
                }));
            } else {
              return tls.createSecureContext({
                key: fs.readFileSync('./config/ssl/'+domain+'/key.pem', 'utf8'),
                cert: fs.readFileSync('./config/ssl/'+domain+'/cert.pem', 'utf8'),
                ca: fs.readFileSync('./config/ssl/'+domain+'/ca.pem', 'utf8')
              })
            }
        } else {
          if (cb) {
            cb(null, tls.createSecureContext({
              ca: fs.readFileSync('./config/ssl/ca.pem', 'utf8'),
              key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
              cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
            }));
          } else {
            return tls.createSecureContext({
              ca: fs.readFileSync('./config/ssl/ca.pem', 'utf8'),
              key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
              cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
            })
          }
        }
    },
   ca: fs.readFileSync('./config/ssl/ca.pem', 'utf8'),
   key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
   cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
}
var https_server = https.createServer(ssloptions, app);
// *서버 초기화* //

// 서버 실행
http_server.listen(server_settings.http_port, '0.0.0.0', function() {
  console.log('[Baw Service Server] HTTP server listening on port ' + http_server.address().port);
});
https_server.listen(server_settings.https_port, '0.0.0.0', function(){
  console.log("[Baw Service Server] HTTPS server listening on port " + https_server.address().port);
});
