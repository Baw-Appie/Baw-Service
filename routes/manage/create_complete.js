var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  if(req.user.id) {
    try {
      var { name, service } = req.body
      var date = new Date().toLocaleDateString()
      if (vali.isEmpty(service)) {
        throw ('서비스 데이터 없음')
      }
      if (vali.isEmpty(name)) {
        throw ('ID를 입력해주세요.')
      }
      if ((await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE (owner=? and service=?) OR name=?", [req.user.id, service, name]))).length == 1) {
        throw ('이미 해당 서비스를 활성화했거나, 페이지 이름이 겹칩니다.')
      }
      switch (service) {
        case "1": 
          var sql_Request = SqlString.format("INSERT INTO pages SET name=?, owner=?, service=1, status=1, theme='semanticui', notice='아래 정보를 입력해주시면 최대한 빠르게 처리해 드리겠습니다.', pagedata=json_object('regdate', ?, 'sms_ok', 0, 'mail_ok', 1, 'tg_ok', 0, 'kakao_ok', 0, 'bouns', '없음', 'api_cmd', '', 'disabled', '', 'youtube', '')", [name, req.user.id, date])
          var message = "이제 페이지 설정에서 페이지 테마를 변경하고, 보너스를 설정한 뒤 공지사항을 추가해보세요! 그리고 후원이 도착하면 알려드릴수 있도록 이메일을 발송하도록 자동 설정되었습니다! 가끔가다 알림 서비스가 작동하지 않는 경우가 있으니 해당 문제가 발생하면 카카오톡 pp121324로 꼭 알려주세요!"
          break;
        case "2":
          var sql_Request = SqlString.format("INSERT INTO pages SET name=?, owner=?, service=2, status=1, theme='bootstrap3', notice='아래 정보 입력 후 전송시 전송된 데이터는 정품 인증 사이트에 전송되며 이때 저장되지 않고 바로 Mojang에 연결하여 정품 아이디가 맞는지 확인 후 아이디와 IP주소만 저장됩니다.', pagedata=json_object('regdate', ?, 'mail_ok', 1, 'api_cmd', '', 'auto_process', 0)", [name, req.user.id, date])
          var message = "정품인증 페이지 설정에서 자동으로 인증 완료시 처리 완료 상태로 변경하여 API 명령어를 자동 실행이 가능하도록 설정할 수 있습니다! 입력되는 정보는 최대한 소중하게 관리할 것을 약속드립니다. 가끔가다 정품인증이 씹히는 경우가 있으니 해당 문제가 발생하면 카카오톡 pp121324로 꼭 알려주세요!"
          break;
        case "3":
          var sql_Request = SqlString.format("INSERT INTO pages SET name=?, owner=?, service=3, status=1, theme='bootstrap3', notice='이 정보는 부정확할 수 있으니 직접 접속하여 확인해보시기 바랍니다.', pagedata=json_object('regdate', ?, 'sv_ip', '', 'sv_port', 25565)", [name, req.user.id, date])
          var message = "페이지 설정에서 서버의 IP와 포트를 입력할 수 있으며, SRV 레코드를 지원합니다! 일부 서버에서는 작동하지 않는 문제가 확인되고 있으니, 해당 문제가 발생하면 카카오톡 pp121324로 꼭 알려주세요!"
          break;
      }
      try { await sqlp(sql, sql_Request) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
      var msg = "Baw Service를 선택해주셔서 감사합니다! 페이지가 생성되었습니다! " + message
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        var msg = "페이지 생성에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n(" + err + ")"
      } else {
        var msg = "페이지 생성에 실패했습니다! (" + err + ")"
      }
    } finally {
      req.session.error = msg
      return res.redirect('/manage')
    }
  }
}