var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');

module.exports = function(req, res) {
  var { service } = req.params
  if(req.user && (service == 1 || service == 2 || service == 3)) {
    (async () => {
      var { notice="" } = req.body
      if(service == 1 || service  == 2){
        var { api_cmd="", mail_ok=0 } = req.body
      }
      switch (service) {
        case "1":
          var { youtube="", theme="semanticui", bouns="없음" } = req.body
          var { lookup_ok=0, sms_ok=0, tg_ok=0, kakao_ok=0, browser_ok=0, disabled="" } = req.body
          disabled = disabled.toString()
          var sql_Request = SqlString.format('UPDATE `pages` SET pagedata=json_set(pagedata, "$.mail_ok", ?, "$.bouns", ?, "$.sms_ok", ?, "$.kakao_ok", ?, "$.tg_ok", ?, "$.browser_ok", ?, "$.api_cmd", ?, "$.disabled", ?, "$.youtube", ?, "$.lookup_ok", ?), `notice`=?, `theme`=? WHERE service=1 and owner=?', [mail_ok, bouns, sms_ok, kakao_ok, tg_ok, browser_ok, api_cmd, disabled, youtube, lookup_ok, notice, theme, req.user.id])
          break;
        case "2":
          var { auto_process=0 } = req.body
          var sql_Request = SqlString.format("UPDATE `pages` SET pagedata=json_set(pagedata, '$.mail_ok', ?, '$.api_cmd', ?, '$.auto_process', ?), `notice`=? WHERE service=2 and owner=?", [mail_ok, api_cmd, auto_process, notice, req.user.id])
          break;
        case "3":
          var { sv_ip="", sv_port="" } = req.body
          var sql_Request = SqlString.format("UPDATE `pages` SET pagedata=json_set(pagedata, '$.sv_ip', ?, '$.sv_port', ?), `notice`=? WHERE service=3 and owner=?", [sv_ip, sv_port, notice, req.user.id])
          break;
        default:
          return res.json({ success: false, title: "작업 실패", message: "지정되지 않은 작업 요청" })
      }
      try { await sqlp(sql, sql_Request) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
      return res.json({ success: true, title: "완료했습니다!",  message: "성공적으로 페이지 수정을 요청했습니다." })
    })()
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "로그인하지 않았거나, 서비스 접근 권한이 없습니다." });
  }
};
