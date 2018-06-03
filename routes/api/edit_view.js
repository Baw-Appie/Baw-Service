var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == "API") {
        var data = {
          "name": "API 플러그인"
        }
        var select_option = ["api_ok"]
        var select_option_korean = ["API 플러그인 사용"]
        var text_option = ["api_ip","api_port","api_key"]
        var text_option_korean = ["API 플러그인 IP(Socket 전용)", "API 플러그인 포트(Socket 전용)", "API 키"]
        var textarea_option = []
        var textarea_option_korean = []
        var custom_select_option = [{name: "api", korean: "API 타입", options: ["HTTP", "socket"], option_data: ["HTTP", "socket"], option_korean: ["HTTP", "socket"]}]
        var custom_text = ['<script>function randomString(){for(var n="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",t="",r=0;r<15;r++){var e=Math.floor(Math.random()*n.length);t+=n.substring(e,e+1)}return t}function input_Text(){document.getElementsByName("api_key")[0].value=randomString()}</script><button class="uk-button uk-button-danger uk-width-1-1" type="button" onclick="input_Text()"><i class="fas fa-redo-alt"></i> API 키  재설정</button><br><a target="_blank" href="https://www.icloud.com/iclouddrive/0HQuoqJ7Y9pNqZ5KJqACRLL7Q#BawServiceAPI-1.0.jar"><button type="button" class="uk-button uk-button-default uk-width-1-1">API 소켓 플러그인 다운로드 (v1.0)</button></a><br><a target="_blank" href="https://www.icloud.com/iclouddrive/0-hK77REwF5YNej0qTI-SGGSg#BawServiceHTTPAPI-1.0.jar"><button type="button" class="uk-button uk-button-default uk-width-1-1">API HTTP 플러그인 다운로드 (v1.0)</button></a><br>']
        var help = `<p>API 플러그인 중 소켓 버전을 사용할 시 사용자가 처리한 후원을 즉시 서버로 요청을 전달할 수 있습니다.</p>
		<p>그 대신 단, 포트가 1개가 필요합니다.</p>
		<p>소켓 버전은 서버와 Baw Service가 서로 연결이 불가능할때 Baw Service에서 후원을 처리할 수 없습니다.</p><br>
		<p>HTTP 버전 사용시 후원은 1분마다 Baw Service와 연결하게 되며 서버가 오프라인상태에서 후원이 처리되어도 서버가 인터넷에 연결되면 한번에 모두 처리됩니다.</p><br>
		<p>후원 처리시 무조건 서버와 Baw Service가 연결이 가능하며 포트 1개를 API에 할당이 가능할때에는 소켓 버전을,</p>
		<p>불가능할때에는 HTTP 버전을 사용하세요.</p>
		<p>API 관련하여 궁금하신 사항이 있으시다면 언제든지 카카오톡 pp121324로 연락 부탁드립니다.</p>`

        var sql_req = sql.query('select * from id where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            req.session.error = data.name+'가 비활성화되어 있습니다.';
            res.redirect('/')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_select_option: custom_select_option, custom_text: custom_text, help: help})
          }
        });
      } else if(req.params.service == "SMS") {
        var data = {
          "name": "SMS 알림"
        }
        var select_option = []
        var select_option_korean = []
        var text_option = ["phone"]
        var text_option_korean = ["전화번호"]
        var textarea_option = []
        var textarea_option_korean = []
        var custom_select_option = []
        var custom_text = ['<p>SMS 부가 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 사용하려면 후원 사이트 수정에서 SMS 알림이 켜져있다면 꺼주세요.</p>']

        var sql_req = sql.query('select * from sms where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            var sql_req = sql.query(SqlString.format('insert into sms values (?, "010-0000-0000", 0, 0)', [req.user.id]), function(err, rows2){
              req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
              res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
            })
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_select_option: custom_select_option, custom_text: custom_text})
          }
        });
      } else if(req.params.service == "Kakao") {
        var data = {
          "name": "카카오톡 알림"
        }
        var select_option = []
        var select_option_korean = []
        var text_option = ["phone"]
        var text_option_korean = ["전화번호"]
        var textarea_option = []
        var textarea_option_korean = []
        var custom_select_option = []
        var custom_text = ['<p>카카오톡 알림 서비스의 전화번호는 수정할 수 없습니다. 수정하려면 카카오톡 고객센터 @b_noti로 알려주세요.</p><p>만약 SMS 알림 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 이용하려면 후원 사이트에서 SMS 알림이 켜져있다면 꺼주세요.</p><p> [제일 중요] 카카오측의 검수로 인하여 카카오톡 알림 서비스는 현재 지원되지 않습니다. 서비스가 복구되면 다시 알려드리겠습니다.</p>']

        var sql_req = sql.query('select * from katalk where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            res.send('<script>location.replace("/secuity/allow_katalk")</script>')
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_select_option: custom_select_option, custom_text: custom_text, do_not_save: true})
          }
        });
      } else if(req.params.service == "Telegram") {
        var data = {
          "name": "Telegram 알림"
        }
        var select_option = []
        var select_option_korean = []
        var text_option = ["chat_id"]
        var text_option_korean = ["채팅방 ID"]
        var textarea_option = []
        var textarea_option_korean = []
        var custom_select_option = []
        var help = `<p>Telegram에서 @BawServiceBot을 초대하여 '채팅방 ID'라고 질문하세요.</p>`

        var sql_req = sql.query('select * from telegram where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            var sql_req = sql.query(SqlString.format('insert into telegram values (?, "")', [req.user.id]), function(err, rows2){
              req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
              res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
            })
          } else {
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_select_option: custom_select_option, help: help})
          }
        });

      } else if(req.params.service == "Custom") {
        var data = {
          "name": "커스텀 도메인"
        }
        var select_option = []
        var select_option_korean = []
        var text_option = ["domain"]
        var text_option_korean = ["연결할 도메인"]
        var textarea_option = []
        var textarea_option_korean = []
        var custom_select_option = []

        var sql_req = sql.query('select * from custom_domain where owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            var date = new Date().toLocaleDateString()
            var sql_req = sql.query('select * from page where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows2){
              if(rows2.length === 1){
                var sql_req = sql.query(SqlString.format('INSERT INTO `custom_domain` VALUES (NULL, ?, ?, "example.com", ?, 1);', [req.user.id, date, rows2[0]['name']]), function(err, rows3){
                  req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
                  res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
                })
              } else {
                req.session.error = "후원 홈페이지 이용자만 사용이 가능합니다."
                res.redirect('/')
              }
            })
          } else {
            var custom_text = "연결 후 해당 도메인을 CNAME 레코드로 dev.rpgfarm.com에 연결하세요.<br>현재 연결 대상 사이트: https://baws.kr/" + rows[0]['go']
            res.render('manage/edit', {rows: rows,data: data,select_option: select_option,select_option_korean: select_option_korean,text_option: text_option,text_option_korean: text_option_korean,textarea_option: textarea_option,textarea_option_korean: textarea_option_korean, custom_select_option: custom_select_option, custom_text: custom_text})
          }
        });

      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
