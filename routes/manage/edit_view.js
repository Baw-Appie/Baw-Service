var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        var select_option = ["mail_ok", "sms_ok", "kakao_ok", "tg_ok", "slack_ok"]
        var select_option_korean = ["후원 Mail 알림", "후원 SMS 알림", "후원 KakaoTalk 알림", "후원 Telegram 알림", "후원 Slack 알림"]
        var text_option = ["bouns","api_cmd","youtube"]
        var text_option_korean = ["후원 보너스 설정", "API 플러그인 명령어 설정", "Youtube Video ID 설정"]
        var textarea_option = ["notice"]
        var textarea_option_korean = ["공지사항"]
        var custom_select_option = [{name: "theme", korean: "테마(베타)", options: ["Bootstrap3", "UiKit", "Bootstrap4"], option_data: ["bootstrap3", "uikit", "bootstrap4"], option_korean: ["Bootstrap3", "UIKit", "Bootstrap4"]}]
        var custom_checkbox_option = [{name: "disabled", korean: "사용하지 않을 후원 방법", options: ["문화상품권", "도서 문화상품권", "해피머니", "틴캐시", "계좌이체"], option_data: ["문화상품권1", "도서문화상품권", "해피머니", "틴캐시", "계좌이체"], option_korean: ["문화상품권", "도서 문화상품권", "해피머니", "틴캐시", "계좌이체"]}]
        var help = `<p>후원 보너스 설정의 다음줄은 || 으로 구분합니다.</p>
			<p>후원 보너스 설정 예제: 캐시||칭호||Baw Service 최고</p>
			<p>API 플러그인의 사용을 원치 않는경우 API 플러그인 명령어칸을 빈칸으로 설정해주세요.</p>
			<p>API 플러그인 명령어 플레이스 홀더 [유저이름: &lt;player&gt;] [후원 금액: &lt;money&gt;] [후원 보상: &lt;package&gt;]</p>
			<p>API 플러그인 명령어는 콘솔에서 실행됩니다. '/'를 입력할 필요가 없습니다.</p>
			<p>API 플러그인 명령어 예제: say &lt;player&gt;님이 &lt;money&gt;원으로 &lt;package&gt;(을)를 구매했습니다!</p>
			<p><a href='https://`+ req.hostname +`/api/API/edit'>[API 설정]</a></p>
			<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        var sql_req = sql.query('select * from page where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_checkbox_option: custom_checkbox_option, help: help, custom_select_option: custom_select_option})
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
        var help = `<p>API 플러그인의 사용을 원치 않는경우 API 플러그인 명령어칸을 빈칸으로 설정해주세요.</p>
			<p>API 플러그인 명령어 플레이스 홀더 [유저이름: &lt;player&gt;]</p>
			<p>API 플러그인 명령어는 콘솔에서 실행됩니다. '/'를 입력할 필요가 없습니다.</p>
			<p>API 플러그인 명령어 예제: say &lt;player&gt; 님이 Baw Service에서 정품인증을 완료했습니다!</p>
			<p><a href='https://`+ req.hostname +`/api/API/edit'>[API 설정]</a></p>
			<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        var sql_req = sql.query('select * from page where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품 인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, help: help})
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
        var help = `<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        var sql_req = sql.query('select * from page where service=3 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '서버 상태 위젯이 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, help: help})
          }
        });

      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
