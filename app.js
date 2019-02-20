// 모듈 로드
var Sqreen = require('sqreen');
var express = require('express')
var http = require('http');
var https = require('spdy');
var tls = require('tls');
var fs = require('fs');
var server_settings = require('./config/server_settings');
var bodyParser = require('body-parser');
var app = express();
var cookieSession = require('cookie-session')
var session_config = require('./config/session');
var oauth_info = require('./config/oauth_info');
var allow_ips = require('./config/allow_ips');
var compression = require('compression')
var RateLimit = require('express-rate-limit');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var Raven = require('raven');
var admin = require('firebase-admin');

admin.initializeApp({credential: admin.credential.cert(require('./config/service-account.json'))});

Array.prototype.forEachAsync = async function(cb){
  var no = 0
  for(let x of this){
    await cb(x, no);
    no++
  }
}
var version = require('child_process').execSync('git rev-parse HEAD').toString().trim()
console.log("[Baw Service Server] Baw Service "+version+" Starting..")

if(server_settings.sentry_error == true) { Raven.config(server_settings.sentry, { release: version }).install() }

app.set('view engine', 'pug');
app.set('views', './views');
app.set('trust proxy', (ip) => { return require('ip-range-check')(ip, require('./config/allowed-proxys.json')) });
// app.set('trust proxy', (ip) => { return ip === '127.0.0.1' });

// 서버 초기화
if(server_settings.pretty_html == true) { app.locals.pretty = true }
if(server_settings.sentry_error == true){ app.use(Raven.requestHandler()) }
app.use(compression())
app.use(cookieSession({ name: 'session', keys: [session_config.secret], maxAge: 24 * 60 * 60 * 1000 }))
app.use(passport.initialize())
app.use(passport.session())
app.use(Sqreen.middleware)
app.use((req,res,next) => {
  if((req.hostname == server_settings.hostname || fs.existsSync('./config/ssl/' + req.hostname + '/key.pem')) && !req.secure) { return res.redirect('https://' + req.get('host') + req.url)}
  if(req.header( 'X-PJAX' )) { res.locals.pjax = true }
  if(server_settings.whitelist == true && allow_ips.indexOf(req.ip) == 0) { return res.status('403').send('HTTP 403: 현재 Baw Service에 '+req.ip+'으로 접근할 수 없습니다. 관리자에게 문의하세요.')}
  res.locals.session = req.session
  res.locals.user = req.user
  res.locals.server_settings = server_settings
  res.locals.oauth_info = oauth_info
  res.locals.version = version
  res.locals.browser = require('useragent').lookup(req.headers['user-agent']).family
  next()
})
app.use(require('./libs/logging'))
app.use(require('./libs/hostname'))
app.use(require('./libs/custom_domains'))
app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static('public'))
app.use('/.well-known', express.static('.well-known'))
app.use('/public/fontawesomepro', express.static('node_modules/@fortawesome/fontawesome-pro'))

// *페이지 라우터* //
// 메인
app.all('/', require('./routes/index'));
app.all('/manifest.json', (req, res) => res.json({
  short_name: "Baw Service",
  name: "Baw Service Console",
  icons: [{
    src: "/public/img/favicon.jpg",
    type: "image/jpg",
    sizes: "64x64"
  },
  {
    src: "/public/img/icon.png",
    type: "image/png",
    sizes: "512x512"
  }],
  start_url: "/",
  gcm_sender_id: "103953800507",
  display: "standalone",
  theme_color: "#c4daff",
  background_color: "#ffffff"
}))
app.all('/firebase_init.js', (req, res) => res.type("js").send(`firebase.initializeApp({'messagingSenderId': '`+server_settings.firebase_SenderID+`'});`))
app.all('/firebase-messaging-sw.js', (req, res) => res.sendFile("./public/firebase-messaging-sw.js", { root: __dirname }))
app.all('/UnsupportedBrowser', (req, res) => res.render('./UnsupportedBrowser') )
app.all('/contact', (req, res) => res.render('./contact') )
// *보안* //
// 카카오톡 활성화 요청
app.get('/secuity/allow_katalk', (req, res) => {
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
// *개인설정* //

app.get('/action/:code', require('./routes/action'))

// 페이지 관리
app.get('/manage', require('./routes/manage/index'));
app.get('/manage/create', require('./routes/manage/create_view'))
app.post('/manage/create', require('./routes/manage/create_complete'))
app.get('/manage/:service/view', require('./routes/manage/view'));
app.all('/manage/:service/complete/:id/:status', require('./routes/manage/complete'))
app.post('/manage/:service/edit', require('./routes/manage/edit_complete'))
app.get('/manage/:service/edit', require('./routes/manage/edit_view'))
app.get('/manage/:service/data_export_excel', require('./routes/manage/data_export_excel'))
app.post('/manage/:service/data_add', require('./routes/manage/data_add'))
app.get('/manage/:service/data_manager', require('./routes/manage/data_manager'))
var DeleteLimiter = new RateLimit({ windowMs: 20*60*1000, delayMs: 0, max: 10,  message: "너무 많은 삭제 요청이 감지되었습니다. 잠시 후에 다시 시도하세요." });
app.all('/manage/:service/data_delete', DeleteLimiter, require('./routes/manage/data_delete'))
app.post('/manage/:service/lookup', require('./routes/manage/lookup'))

// Tools
app.all('/tools', (req, res) => res.render('tools/index'))
app.get('/tools/:tool', require('./routes/tools/use'))
app.post('/tools/:tool', require('./routes/tools/use_complete'))

// API 관리
app.all('/api', require('./routes/api/index'))
app.post('/api/:service/edit', require('./routes/api/edit_complete'))
app.get('/api/:service/edit', require('./routes/api/edit_view'))
app.post('/api/Browser/:type', require('./routes/api/Browser'))

// API 요청 처리
app.all(['/api/serveripcheck.php', '/API/GetServerIP'], (req,res) => res.send(server_settings.server_ip))
app.all(['/api/versionchecker.php', '/API/GetAPIVersion'], (req,res) => res.send("1.0"))
app.all(['/api/versioncheckerHTTP.php', '/API/GetHTTPAPIVersion'], (req,res) => res.send("1.0.1"))
app.all(['/api/getlist.php', '/API/GetList'], require('./routes/api/getlist'))

// 유저 활동 처리
app.post('/user/donation', require('./routes/user/donation_complete'))
app.post('/user/id_check', require('./routes/user/id_check_complete'))

// 서버 아이콘 셋팅
app.get('/favicon.ico', (req, res) => res.download('./public/img/favicon.ico'))

// *인증 * //
var LoginLimiter = new RateLimit({ windowMs: 20*60*1000, delayMs: 0, max: 25,  message: "너무 많은 로그인 시도가 감지되었습니다. 잠시 후 다시 시도하세요." });
var APILimiter = new RateLimit({ windowMs: 10*60*1000, delayMs: 0, max: 1000,  message: "너무 많은 시도가 감지되었습니다. 잠시 후 다시 시도하세요." });
app.get('/auth/recovery', (req, res) => res.render('auth/recovery'))
app.post('/auth/recovery', LoginLimiter, require('./routes/auth/recovery'))
app.post('/auth/setPassword', require('./routes/auth/setPassword'))
app.get('/auth/register', (req, res) => res.render('auth/register'))
app.post('/auth/exist/:type', require('./routes/auth/exist'))
app.post('/auth/register', require('./routes/auth/register'))
app.get('/auth/check-email', require('./routes/auth/check-email'))
app.get('/auth/oauth', LoginLimiter, require('./routes/auth/oauth'))
app.post('/auth/oauth/verify', APILimiter, require('./routes/auth/oauth_verify'))

app.get('/auth/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})
app.get('/auth/login', (req, res) => res.render('login'))
app.get('/auth/kakao', passport.authenticate('kakao',{ failureRedirect: '/auth/login' }))
app.get('/auth/google', passport.authenticate('google', { scope: [ 'email' ] }))
app.all('/auth/:type/callback', (req, res, next) => {
  var {type} = req.params
  if(type == "login") type = "local"
  if(type == "local" || type == "kakao" || type == "google") {
    passport.authenticate(type, (err, user, info) => {
      if(err) return res.redirect('/auth/login')
      req.logIn(user, (err) => {
        if(err) return res.redirect('/auth/login')
        if(req.session.redirect) {
          var r = req.session.redirect
          delete req.session.redirect
          res.redirect(r)
          return
        }
        return res.redirect('/');
      })
    })(req, res, next)
  } else {
    res.redirect('/auth/login')
  }
})
// *인증 * //
// *페이지 라우터* //

// *PassportJS* //
passport.serializeUser((user, done) => { return done(null, user) })
passport.deserializeUser((user, done) => { done(null, user) });
passport.use(new LocalStrategy({usernameField: 'id', passwordField: 'pass', session: true, passReqToCallback: true }, require('./libs/passport/local')));
passport.use(new GoogleStrategy({clientID: oauth_info.googleid, clientSecret: oauth_info.googlesecret, callbackURL: "https://"+server_settings.hostname+"/auth/google/callback", passReqToCallback: true}, require('./libs/passport/google')));
passport.use(new KakaoStrategy({clientID: oauth_info.kakaoid,clientSecret: oauth_info.kakaosecret, callbackURL: "https://"+server_settings.hostname+"/auth/kakao/callback", passReqToCallback: true}, require('./libs/passport/kakao')));
// *PassportJS* //

// 유저 페이지 로드 및 404 서버 에러 처리
app.use((req, res, next) => require('./libs/userpage-with-404')(req, res, next, req.path.split('/')[1]))

// 500 서버 에러 처리
if(server_settings.sentry_error == true){
  app.use(Raven.errorHandler());
}
app.use(function(err, req, res, next) {
  console.error('[Error] 처리할 수 없는 문제로 500 에러가 사용자에게 출력되고 있습니다. '+err.message)
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
var http_server = http.createServer(app)

// Baw Service 인증을 위한 SSL 자동 적용
function getSSL(domain) {
  if(fs.existsSync('./config/ssl/' + domain + '/key.pem'))
  return {key: fs.readFileSync('./config/ssl/'+domain+'/key.pem', 'utf8'), cert: fs.readFileSync('./config/ssl/'+domain+'/cert.pem', 'utf8'), ca: fs.readFileSync('./config/ssl/'+domain+'/ca.pem', 'utf8') }
  else return {ca: fs.readFileSync('./config/ssl/ca.pem', 'utf8'), key: fs.readFileSync('./config/ssl/key.pem', 'utf8'), cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')}
}
var ssloptions = {
  SNICallback: (domain, cb) => {
    if (cb) {
      cb(null, tls.createSecureContext(getSSL(domain)));
    } else {
      return tls.createSecureContext(getSSL(domain))
    }
  },
 ca: fs.readFileSync('./config/ssl/ca.pem', 'utf8'),
 key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
 cert: fs.readFileSync('./config/ssl/cert.pem', 'utf8')
}
var https_server = https.createServer(ssloptions, app);
// *서버 초기화* //

// 서버 실행
http_server.listen(server_settings.http_port, '0.0.0.0', () => console.log('[Baw Service Server] HTTP server listening on port ' + http_server.address().port));
https_server.listen(server_settings.https_port, '0.0.0.0', () => console.log("[Baw Service Server] HTTPS server listening on port " + https_server.address().port));
