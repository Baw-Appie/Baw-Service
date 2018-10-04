var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == 1) {
        var data = {
          "name": "후원 사이트",
          "service": 1
        }
        var options = {
          "groups": {
            "general": {
              korean: "일반",
              description: "사이트 일반 설정",
              select: [{ name: "lookup_ok", korean: "후원 기록 조회 허용" }],
              text: [
                { name: "bouns", korean: "후원 보너스"},
                { name: "youtube", korean: "Youtube Video ID"}
              ],
              textarea: [{ name: "notice", korean: "공지사항" }],
              custom_select: [{ name: "theme", korean: "테마 (베타)", option_data: ["semanticui", "bootstrap3", "uikit", "bootstrap4", "material"], option_korean: ["Semantic UI", "Bootstrap3", "UIKit", "Bootstrap4", "Material (Beta)"] }]
            },
            "integration": {
              korean: "사이트 서비스 통합",
              description: "알림 / API 서비스 통합",
              select: [
                { name: "mail_ok", korean: "메일 알림" },
                { name: "sms_ok", korean: "SMS 알림" },
                { name: "kakao_ok", korean: "카카오톡 알림" },
                { name: "tg_ok", korean: "텔레그램 알림" },
                { name: "browser_ok", korean: "브라우저 푸쉬 알림"},
              ],
              text: [{ name: "api_cmd", korean: "API 플러그인 명령어" }]
            }
          },
          "savetojson": ["mail_ok", "sms_ok", "kakao_ok", "tg_ok", "browser_ok", "lookup_ok", "bouns","api_cmd","youtube", "disabled"]
        }
        var help = `<p>후원 보너스 설정의 다음줄은 || 으로 구분합니다.</p>
			<p>후원 보너스 설정 예제: 캐시||칭호||Baw Service 최고</p>
			<p>API 플러그인의 사용을 원치 않는경우 API 플러그인 명령어칸을 빈칸으로 설정해주세요.</p>
			<p>API 플러그인 명령어 플레이스 홀더 [유저이름: &lt;player&gt;] [후원 금액: &lt;money&gt;] [후원 보상: &lt;package&gt;]</p>
			<p>API 플러그인 명령어는 콘솔에서 실행됩니다. '/'를 입력할 필요가 없습니다.</p>
			<p>API 플러그인 명령어 예제: say &lt;player&gt;님이 &lt;money&gt;원으로 &lt;package&gt;(을)를 구매했습니다!</p>
			<p><a href='https://`+ req.hostname +`/api/API/edit'>[API 설정]</a></p>
			<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        sql.query('select * from pages where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
          } else {
            var pagedata = JSON.parse(rows[0]['pagedata'])
            res.render('manage/edit', { data: data, rows: rows, pagedata: pagedata, help: help, options: options })
          }
        });
      } else if(req.params.service == 2) {
        var data = {
          "name": "정품 인증 사이트",
          "service": 2
        }
        var options = {
          "groups": {
            "general": {
              korean: "일반",
              description: "사이트 일반 설정",
              select: [{ name: "auto_process", korean: "정품인증 자동 처리" }],
              textarea: [{ name: "notice", korean: "공지사항" }]
            },
            "integration": {
              korean: "사이트 서비스 통합",
              description: "알림 / API 서비스 통합",
              text: [
                { name: "api_cmd", korean: "API 플러그인 명령어"}
              ],
              select: [
                { name: "mail_ok", korean: "메일 알림" }
              ]
            }
          },
          "savetojson": ["mail_ok", "auto_process", "api_cmd"]
        }
        var help = `<p>API 플러그인의 사용을 원치 않는경우 API 플러그인 명령어칸을 빈칸으로 설정해주세요.</p>
			<p>API 플러그인 명령어 플레이스 홀더 [유저이름: &lt;player&gt;]</p>
			<p>API 플러그인 명령어는 콘솔에서 실행됩니다. '/'를 입력할 필요가 없습니다.</p>
			<p>API 플러그인 명령어 예제: say &lt;player&gt; 님이 Baw Service에서 정품인증을 완료했습니다!</p>
			<p><a href='https://`+ req.hostname +`/api/API/edit'>[API 설정]</a></p>
			<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        sql.query('select * from pages where service=2 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '정품 인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/')
          } else {
            var pagedata = JSON.parse(rows[0]['pagedata'])
            res.render('manage/edit', { data: data, rows: rows, pagedata: pagedata, help: help, options: options })
          }
        });

      } else if(req.params.service == 3) {
        var data = {
          "name": "서버 상태 위젯",
          "service": 3
        }
        var options = {
          "groups": {
            "general": {
              korean: "일반",
              description: "사이트 일반 설정",
              text: [
                { name: "sv_ip", korean: "서버 IP" },
                { name: "sv_port", korean: "서버 PORT" }
              ],
              textarea: [{ name: "notice", korean: "공지사항" }]
            }
          },
          "savetojson": ["sv_ip", "sv_port"]
        }
        var help = `<p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

        sql.query('select * from pages where service=3 and owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = '서버 상태 위젯이 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
            res.redirect('/manage')
          } else {
            var pagedata = JSON.parse(rows[0]['pagedata'])
            res.render('manage/edit', { data: data, rows: rows, pagedata: pagedata, help: help, options: options })
          }
        });

      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
