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
var SqlString = require('sqlstring');
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;


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

app.get('/manage', function (req, res) {
  if(req.session.user) {
    res.render('manage/index');
  } else {
    res.redirect('/auth/login')
  }
});

app.post('/manage/:service/edit', function(req, res) {
  if(req.session.user) {
      if(req.params.service){
        var service = req.params.service;
      	var notice = req.body.notice;
      } else {
      	var notice = "";
      }

      if(service == 1 || service  == 2){
      	if(req.body.mail_ok){
      		var mail_ok = req.body.mail_ok;
      	} else {
      		var mail_ok = 1;
      	}
      	if(req.body.api_cmd) {
      		var api_cmd = req.body.api_cmd;
      	} else {
      		var api_cmd = "";
      	}
      }
      if(service == 2){
      	if(req.body.auto_process){
      		var auto_process = req.body.auto_process;
      	} else {
      		var auto_process = 1;
      	}
      }

      if(service == 1){
      	if(req.body.youtube){
      		var youtube = req.body.youtube;
      	} else {
      		var youtube = "";
      	}
      	if(req.body.disabled){
      		var disable = req.body.disabled;
      	} else {
      		var disable = "";
      	}
      	if(req.body.theme){
      		var theme = req.body.theme;
      	} else {
      		var theme = "bootstrap3";
      	}
      	var disabled = "계좌이체";
      	if(req.body.bouns){
      		var bouns = req.body.bouns;
      	} else {
      		var bouns = "";
      	}
      	if(req.body.sms_ok){
      		var sms_ok = req.body.sms_ok;
      	} else {
      		var sms_ok = 0;
      	}
      	if(req.body.slack_ok){
      		var slack_ok = req.body.slack_ok;
      	} else {
      		var slack_ok = 0;
      	}
      	if(req.body.tg_ok){
      		var tg_ok = req.body.tg_ok;
      	} else {
      		var tg_ok = 0;
      	}
      	if(req.body.kakao_ok){
      		var kakao_ok = req.body.kakao_ok;
      	} else {
      		var kakao_ok = 0;
      	}
      }
      if(service == 3){
      	if(req.body.sv_ip){
      		var sv_ip = req.body.sv_ip;
      	} else {
      		var sv_ip = "";
      	}
      	if(req.body.sv_port){
      		var sv_port = req.body.sv_port;
      	} else {
      		var sv_port = "";
      	}
      }

      if(req.params.service == 1) {
        var sql_req = sql('UPDATE `page` SET `mail_ok` = ' + SqlString.escape(mail_ok) + ', `bouns` = ' + SqlString.escape(bouns) + ', `sms_ok` = ' + SqlString.escape(sms_ok) + ', `slack_ok` = ' + SqlString.escape(slack_ok) + ', `kakao_ok` = ' + SqlString.escape(kakao_ok) + ', `tg_ok` = ' + SqlString.escape(tg_ok) + ', `api_cmd` = ' + SqlString.escape(api_cmd) + ', `disabled`=' + SqlString.escape(disabled) + ', `notice` =  ' + SqlString.escape(notice) +', `theme`=' + SqlString.escape(theme) + ', `youtube`=' + SqlString.escape(youtube) + ' WHERE service=1 and owner=' + SqlString.escape(req.session.user))
      }

      if(req.params.service == 2) {
      	var sql_req = sql("UPDATE `page` SET `mail_ok` = " + SqlString.escape(mail_ok) + ", `api_cmd` = " + SqlString.escape(api_cmd) +", `notice`=" + SqlString.escape(notice) + ", `youtube`=" + SqlString.escape(youtube) + " , `auto_process`=" + SqlString.escape(auto_process) + " WHERE service=2 and owner=" + SqlString.escape(req.session.user))
      }
      if(req.params.service == 3) {
      	var sql_req = sql("UPDATE `page` SET `sv_ip` = " + SqlString.escape(sv_ip) + ", `sv_port` = " + SqlString.escape(sv_port) + ", `notice`=" + SqlString.escape(notice) + ", `youtube`=" + SqlString.escape(youtube) + " WHERE service=3 and owner=" + SqlString.escape(req.session.user))
      }
      req.session.error = '적용되었습니다!'
      res.redirect('/')
  } else {
    res.render('error/403')
  }
})

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
