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
var session = require('express-session');
var session_config = require('./config/session');
var SqlString = require('sqlstring');
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

//socket_api(3203, 'localhost', 'connect;pp121324;say hello', function(data){
//  console.log(data.toString())
//});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

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
app.use( allow_ip() );
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('public'));


app.all('/', function (req, res) {
  res.render('index');
});

app.get('/manage', function (req, res) {
  if(req.session.user) {
    res.render('manage/index');
  } else {
    res.redirect('/auth/login')
  }
});

app.get('/manage/:service/view', function (req, res) {
  if(req.session.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원",
          "service": 1
        }
        var list = ["nick", "bal", "method", "pin", "bouns", "ip", "date"];
        var korean = ["닉네임", "후원 금액", "후원 방법", "핀번호", "원하는 보상", "IP", "날짜"]

        var sql_req = sql('select * from page where service=1 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다.';
            res.redirect('/')
    		  }
    		});
        var sql_req2 = sql('select * from service1 where status=0 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          res.render('manage/view', {rows: rows, data: data, list: list, korean: korean})
        });
      }
      if(req.params.service == 2) {
        var data = {
          "name": "정품 인증",
          "service": 2
        }
        var list = ["nick", "ip", "date"];
        var korean = ["닉네임", "IP", "날짜"];

        var sql_req = sql('select * from page where service=2 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품인증 페이지가 존재하지 않습니다.';
            res.redirect('/')
    		  }
    		});
        var sql_req2 = sql('select * from service2 where status=0 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          res.render('manage/view', {rows: rows, data: data, list: list, korean: korean})
        });
      }
  } else {
    res.redirect('/auth/login')
  }
});

app.all('/manage/:service/complete/:id/:status', function(req, res) {
  if(req.session.user) {
    if(isNumber(req.params.id) && isNumber(req.params.service) && isNumber(req.params.status))
      if(req.params.service == "1" || req.params.service == "2"){
        var sql_req = sql('select * from  `service'+req.params.service+'` WHERE owner='+SqlString.escape(req.session.user)+' and num=' + SqlString.escape(req.params.id), function(err, rows){
          if(err) { throw err };
          if(rows.length == 0) {
            res.render('error/403')
          }
          var sql_req2 = sql('UPDATE  `service'+req.params.service+'` SET status='+SqlString.escape(req.params.status)+' WHERE num=' + SqlString.escape(req.params.id), function(err, rows){
            if(err) { throw err };
            req.session.error = "적용되었습니다.";
            res.redirect('/');
          });
        });
      } else {
        res.render('error/403')
      }
    } else {
      res.render('error/403')
    }
})

app.post('/manage/:service/edit', require('./routes/manage/edit_complete'))

app.get('/manage/:service/edit', function (req, res) {
    if(req.session.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        var select_option = ["mail_ok", "sms_ok", "kakao_ok", "tg_ok", "slack_ok"]
        var select_option_korean = ["후원 Mail 알림", "후원 SMS 알림", "후원 KakaoTalk 알림", "후원 Telegram 알림", "후원 Slack 알림"]
        var text_option = ["disabled", "bouns","api_cmd","youtube"]
        var text_option_korean = ["사용하지 않을 후원 방법", "후원 보너스 설정", "API 플러그인 명령어 설정", "Youtube Video ID 설정"]
        var textarea_option = ["notice"]
        var textarea_option_korean = ["공지사항"]

        var sql_req = sql('select * from page where service=1 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다.';
            res.redirect('/')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean})
          }
        });
      } else if(req.params.service == 2) {
        var data = {
          "name": "정품 인증 사이트",
          "service": 2
        }
        var select_option = ["mail_ok", "auto_process"]
        var select_option_korean = ["정품 인증 Mail 알림", "정품인증 자동 처리"]
        var text_option = ["api_cmd"]
        var text_option_korean = ["API 플러그인 명령어 설정"]
        var textarea_option = ["notice"]
        var textarea_option_korean = ["공지사항"]

        var sql_req = sql('select * from page where service=2 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품 인증 페이지가 존재하지 않습니다.';
            res.redirect('/')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean})
          }
        });

      } else if(req.params.service == 3) {
        var data = {
          "name": "서버 상태 위젯",
          "service": 3
        }
        var select_option = []
        var select_option_korean = []
        var text_option = ["sv_ip", "sv_port"]
        var text_option_korean = ["서버 IP", "서버 PORT"]
        var textarea_option = ["notice"]
        var textarea_option_korean = ["공지사항"]

        var sql_req = sql('select * from page where service=3 and owner=' + SqlString.escape(req.session.user), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품 인증 페이지가 존재하지 않습니다.';
            res.redirect('/')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean})
          }
        });

      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
});

app.get('/auth/logout', function(req, res){
  req.session.destroy(function(err){
      if(err){
          console.log('[Baw Service Error Report] 세션 삭제 도중 오류 발생: ' + err);
      }else{
          res.redirect('/');
      }
  })
})
app.get('/auth/login', function(req, res){
  res.render('login');
})
app.post('/auth/login', function (req, res) {
  var id = req.body.id;
  var pw = req.body.pass;
  if (id === undefined || pw === undefined || id === "" || pw === ""){
    res.render('error/500')
    req.session.error = '아이디와 비밀번호를 입력해주세요.';
    res.redirect('/')
  } else {
    var login_req = sql('select * from id where id=' + SqlString.escape(id) + ' and password=password(' + SqlString.escape(pw) + ')', function(err, rows){
      if (rows.length === 0) {
        req.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
        res.redirect('/')
      } else {
        req.session.user = rows[0].id;
        req.session.error = rows[0].id + '로 로그인했습니다.';
        res.redirect('/')
      }
    });
  }
});

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
