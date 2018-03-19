var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user.id) {
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

        var sql_req = sql('select * from page where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
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

        var sql_req = sql('select * from page where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
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

        var sql_req = sql('select * from page where service=3 and owner=' + SqlString.escape(req.user.id), function(err, rows){
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
};
