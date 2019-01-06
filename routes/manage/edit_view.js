var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');
module.exports = async (req, res) => {
  if (req.user) {
    if (req.params.service == 1) {
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
              { name: "bouns", korean: "후원 보너스" },
              { name: "youtube", korean: "Youtube Video ID" },
              { name: "background", korean: "백그라운드 이미지 URL" }
            ],
            textarea: [{ name: "notice", korean: "공지사항" }],
            custom_select: [{ name: "theme", korean: "테마 (베타)", option_data: ["semanticui", "bootstrap3", "uikit", "bootstrap4", "material"], option_korean: ["Semantic UI", "Bootstrap3", "UIKit", "Bootstrap4", "Material (Beta)"] }],
            custom_checkbox: [{ name: "disabled", korean: "사용하지 않을 후원 방법", option_data: ["문화상품권1", "도서문화상품권", "해피머니", "틴캐시", "계좌이체"], option_korean: ["문화상품권", "도서 문화상품권", "해피머니", "틴캐시", "계좌이체"] }]
          },
          "integration": {
            korean: "사이트 서비스 통합",
            description: "알림 / API 서비스 통합",
            select: [
              { name: "mail_ok", korean: "메일 알림" },
              { name: "sms_ok", korean: "SMS 알림" },
              { name: "kakao_ok", korean: "카카오톡 알림" },
              { name: "tg_ok", korean: "텔레그램 알림" },
              { name: "browser_ok", korean: "브라우저 푸쉬 알림" },
            ],
            text: [{ name: "api_cmd", korean: "API 플러그인 명령어" }]
          }
        },
        "savetojson": ["mail_ok", "sms_ok", "kakao_ok", "tg_ok", "browser_ok", "lookup_ok", "bouns", "api_cmd", "youtube", "disabled", "background"]
      }
      var help = "openlink:https://baw-service.tistory.com/40"
      var rows = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))
      if (rows.length == 0) {
        req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
        return res.redirect('/manage')
      }
      res.render('manage/edit', { data: data, rows: rows, pagedata: JSON.parse(rows[0]['pagedata']), help: help, options: options })
    } else if (req.params.service == 2) {
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
              { name: "api_cmd", korean: "API 플러그인 명령어" }
            ],
            select: [
              { name: "mail_ok", korean: "메일 알림" }
            ]
          }
        },
        "savetojson": ["mail_ok", "auto_process", "api_cmd"]
      }
      var help = "openlink:https://baw-service.tistory.com/41"
      var rows = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=2 AND owner=?", [req.user.id]))
      if (rows.length == 0) {
        req.session.error = '정품 인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
        return res.redirect('/manage')
      }
      res.render('manage/edit', { data: data, rows: rows, pagedata: JSON.parse(rows[0]['pagedata']), help: help, options: options })
    } else if (req.params.service == 3) {
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
      var rows = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=3 AND owner=?", [req.user.id]))
      if (rows.length == 0) {
        req.session.error = '서버 상태 위젯이 존재하지 않습니다. 먼저 페이지를 생성해주세요!';
        return res.redirect('/manage')
      }
      res.render('manage/edit', { data: data, rows: rows, pagedata: JSON.parse(rows[0]['pagedata']), options: options })
    } else {
      res.render('error/403')
    }
  } else {
    res.redirect('/auth/login')
  }
}
