var express = require('express')
var http = require('http');
var https = require('https');
var forceSSL = require('express-force-ssl');
var encoding = require("encoding");
var fs = require('fs');
var server_settings = require('./config/server_settings');
var sql = require('./config/dbtool');
var pjax = require('./libs/pjax');
var hostname = require('./libs/hostname');
var allow_ip = require('./libs/allow_ip');
var socket_api = require('./libs/socket_api');
var custom_domains = require('./libs/custom_domains');
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

app.use(function(req,res,next){
    if (req.hostname == server_settings.hostname) {
      forceSSL
    } else if (fs.existsSync('./config/ssl/'+req.hostname+'/key.pem')) {
        forceSSL
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
app.use( pjax() );
app.use( hostname() );
app.use( allow_ip() );
app.use( custom_domains() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));


app.all('/', function (req, res) {
  res.render('index');
});

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

app.post('/api/:service/edit', require('./routes/api/edit_complete'))
app.get('/api/:service/edit', require('./routes/api/edit_view'))

app.post('/user/donation', require('./routes/user/donation_complete'))
app.post('/user/id_check', require('./routes/user/id_check_complete'))

app.get('/favicon.ico', function(req, res){
  res.download('./public/img/favicon.ico');
});

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

app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'https://www.googleapis.com/auth/plus.login',
  	  'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

  app.get( '/auth/google/callback',
  	passport.authenticate( 'google', {
  		successRedirect: '/',
  		failureRedirect: '/auth/login'
  }));

app.get('/auth/kakao', passport.authenticate('kakao',{
    failureRedirect: '/auth/login'
}));

app.get( '/auth/kakao/callback',
  	passport.authenticate( 'kakao', {
  		successRedirect: '/',
  		failureRedirect: '/auth/login'
  }));

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
  passReqToCallback: true
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

var oauth_info = require('./config/oauth_info');
passport.use(new GoogleStrategy({
    clientID: oauth_info.googleid,
    clientSecret: oauth_info.googlesecret,
    callbackURL: "https://"+server_settings.hostname+"/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      var login_req = sql('select * from id where id=' + SqlString.escape(profile.emails[0]['value']), function(err, rows){
        if(err) { done(err) };
        if (rows.length === 0) {
          request.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
          return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
        } else {
          request.session.error = rows[0].id + '로 로그인했습니다.';
          return done(null, {
            'id': rows[0]['id'],
          });
        }
      });
    });
  }
));
passport.use(new KakaoStrategy({
    clientID: oauth_info.kakaoid,
    clientSecret: oauth_info.kakaosecret,
    callbackURL: "https://"+server_settings.hostname+"/auth/kakao/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      if(profile['_json']['kaccount_email_verified'] == true) {
        var login_req = sql('select * from id where id=' + SqlString.escape(profile['_json']['kaccount_email']), function(err, rows){
          if(err) { done(err) };
          if (rows.length === 0) {
            request.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
            return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
          } else {
            request.session.error = rows[0].id + '로 로그인했습니다.';
            return done(null, {
              'id': rows[0]['id'],
            });
          }
        });
      } else {
        request.session.error = '이메일 인증을 먼저 완료하세요.';
        return done(null, false, { message: '이메일 인증을 먼저 완료하세요.' })
      }
    });
  }
));
app.use(function(req, res, next) {
  var path = req.path.split('/')
  var sql_req = sql('select * from page where name=' + SqlString.escape(path[1]), function(err, rows){
    if(err) { throw err }
    if(rows.length === 0) {
      res.status(404).render('error/404')
    } else {
      var servicename;
      if(rows[0]['service'] == '1') {
        var servicename = "donation";
      } else if(rows[0]['service'] == '2') {
        var servicename = "id_check";
      } else if(rows[0]['service'] == '3') {
        var servicename = "server_status"
      } else {
        res.render('error/500')
      }
      if(servicename){
        if(fs.existsSync('./views/user_page/'+servicename+'-'+rows[0]['theme']+'.jade')) {
          var sql_req2 = sql('select * from `id` where `id`='+SqlString.escape(rows[0]['owner']), function(err, rows2) {
            if(err){ throw err }
            var sql_req3 = sql('select * from `page` where `owner`='+SqlString.escape(rows[0]['owner']), function(err, rows3){
              if(err){ throw err }
              if(rows[0]['service'] == '1') {
                res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0]})
              } else if(rows[0]['service'] == '2') {
                res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0]})
              } else if(rows[0]['service'] == '3') {
                var mineping = require("mineping");
                if(rows[0]['sv_ip'] == '' || rows[0]['sv_port'] == '') {
                  res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false})
                } else {
                  const dns = require('dns');
                  dns.resolve('_minecraft._tcp.'+rows[0]['sv_ip'], 'SRV', (err, records) => {
                    if (err) {
                      var ip = rows[0]['sv_ip']
                      var port = rows[0]['sv_port']
                    } else {
                      var ip = records[0]['sv_ip']
                      var port = records[0]['sv_port']
                    }
                    mineping(1, ip, port, function(err, data) {
                      if(err) {
                          res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false})
                      } else {
                        res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: data})
                      }
                    });
                  });
                }
              }
            })
          })
        } else {
          res.render('error/500')
        }
      } else {
        res.render('error/500')
      }
    }
  });
});

app.use(function(err, req, res, next) {
  console.error('[Baw Service Error Report] 처리할 수 없는 문제로 500 에러가 사용자에게 출력되고 있습니다.', err.stack);
  res.status(500).render('error/500')
});

var http_server = http.createServer(app);

var tls = require('tls');
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

http_server.listen(server_settings.http_port, function() {
  console.log('[Baw Service Error Report] server listening on port ' + http_server.address().port);
});
https_server.listen(server_settings.https_port, function(){
  console.log("[Baw Service Error Report] SSL server listening on port " + https_server.address().port);
});
