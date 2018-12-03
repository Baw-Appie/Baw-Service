var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');

module.exports = (req, res) => {
    if(req.user) {
      if(req.params.service == "API") {
        var data = {
          "name": "API 플러그인"
        }
        var options = {
          "groups": {
            "general": {
              korean: "일반",
              description: "외부서비스 통합 설정",
              select: [{ name: "api_enable", korean: "API 플러그인 활성화" }],
              text: [
                { name: "api_ip", korean: "API 플러그인 IP(Socket 전용)"},
                { name: "api_port", korean: "API 플러그인 포트(Socket 전용)"},
                { name: "api_key", korean: "API 키"}
              ],
              custom_select: [{ name: "api_type", korean: "API 타입", option_data: ["HTTP", "socket"], option_korean: ["HTTP", "Socket"] }]
            }
          },
          savetojson: [],
          text: `<script>function randomString(){for(var n="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",t="",r=0;r<15;r++){var e=Math.floor(Math.random()*n.length);t+=n.substring(e,e+1)}return t}function input_Text(){document.getElementsByName("api_key")[0].value=randomString()}</script>
          <button class="ui button icon labeled negative" type="button" onclick="input_Text()"><i class="icon redo"></i> API 키  재설정</button>
          <div class="ui buttons"><a target="_blank" href="https://www.icloud.com/iclouddrive/0HQuoqJ7Y9pNqZ5KJqACRLL7Q#BawServiceAPI-1.0.jar"><button type="button" class="ui button">API 소켓 플러그인 다운로드 (v1.0)</button></a><br><div class="or"></div>
          <a target="_blank" href="https://www.icloud.com/iclouddrive/0-hK77REwF5YNej0qTI-SGGSg#BawServiceHTTPAPI-1.0.jar"><button type="button" class="ui button">API HTTP 플러그인 다운로드 (v1.0)</button></a></div><br>`
        }
        var help = `<p>API 플러그인 중 소켓 버전을 사용할 시 사용자가 처리한 후원을 즉시 서버로 요청을 전달할 수 있습니다.</p>
		<p>그 대신 단, 포트가 1개가 필요합니다.</p>
		<p>소켓 버전은 서버와 Baw Service가 서로 연결이 불가능할때 Baw Service에서 후원을 처리할 수 없습니다.</p><br>
		<p>HTTP 버전 사용시 후원은 1분마다 Baw Service와 연결하게 되며 서버가 오프라인상태에서 후원이 처리되어도 서버가 인터넷에 연결되면 한번에 모두 처리됩니다.</p><br>
		<p>후원 처리시 무조건 서버와 Baw Service가 연결이 가능하며 포트 1개를 API에 할당이 가능할때에는 소켓 버전을,</p>
		<p>불가능할때에는 HTTP 버전을 사용하세요.</p>
		<p>API 관련하여 궁금하신 사항이 있으시다면 언제든지 카카오톡 pp121324로 연락 부탁드립니다.</p>`

        sql.query('select * from api where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            sql.query(SqlString.format("INSERT INTO api SET id=?, api_enable=0, api_key='', api_ip='', api_port=3203, api_type='HTTP'", [req.user.id]), function(err, rows2){
              req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
              res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
            })
          } else {
            res.render('manage/edit', { data: data, rows: rows, help: help, options: options })
          }
        });
      } else if(req.params.service == "SMS") {
        var data = {
          "name": "SMS 알림"
        }
        var options = {
          groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "phone", korean: "전화번호" }] } },
          savetojson: [],
          text: `<p>SMS 부가 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 사용하려면 후원 사이트 수정에서 SMS 알림이 켜져있다면 꺼주세요.</p>`
        }
        sql.query('select * from sms where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            sql.query(SqlString.format('insert into sms values (?, "010-0000-0000", 0, 0)', [req.user.id]), function(err, rows2){
              req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
              res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
            })
          } else {
            res.render('manage/edit', { data: data, rows: rows, options: options })
          }
        });
      } else if(req.params.service == "Kakao") {
        var data = {
          "name": "카카오톡 알림"
        }
        var options = {
          groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "phone", korean: "전화번호" }] } },
          savetojson: [],
          text: `<p>카카오톡 알림 서비스의 전화번호는 수정할 수 없습니다. 수정하려면 카카오톡 고객센터 @b_noti로 알려주세요.</p><p>만약 SMS 알림 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 이용하려면 후원 사이트에서 SMS 알림이 켜져있다면 꺼주세요.</p><p>SMS 서비스와 동일하게 10분당 1회만 전송됩니다.</p>`,
          do_not_save: true
        }
        sql.query('select * from katalk where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            res.send('<script>location.replace("/secuity/allow_katalk")</script>')
          } else {
            res.render('manage/edit', { data: data, rows: rows, help: help, options: options })
          }
        });
      } else if(req.params.service == "Telegram") {
        var data = {
          "name": "Telegram 알림"
        }
        var options = {
          groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "chat_id", korean: "채팅방 ID" }] } },
          savetojson: []
        }
        var help = `<p>Telegram에서 @BawServiceBot을 검색 후 시작해서 채팅방 ID를 클릭하여 채팅방 ID를 가져올 수 있습니다.</p>`

        sql.query('select * from telegram where id=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            sql.query(SqlString.format('insert into telegram values (?, "")', [req.user.id]), function(err, rows2){
              req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
              res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
            })
          } else {
            res.render('manage/edit', { data: data, rows: rows, help: help, options: options })
          }
        });

      } else if(req.params.service == "Custom") {
        var data = {
          "name": "커스텀 도메인"
        }

        sql.query('select * from custom_domain where owner=' + SqlString.escape(req.user.id), function(err, rows){
          if (rows.length === 0) {
            var date = new Date().toLocaleDateString()
            sql.query('select * from pages where service=1 and owner=' + SqlString.escape(req.user.id), function(err, rows2){
              if(rows2.length === 1){
                sql.query(SqlString.format('INSERT INTO `custom_domain` VALUES (NULL, ?, ?, "example.com", ?, 1);', [req.user.id, date, rows2[0]['name']]), function(err, rows3){
                  req.session.error = data.name+' 서비스가 등록되어 있지 않아 서비스를 등록시켰습니다.';
                  res.send('<script>$.pjax({url: location.href, container: "#contents"})</script>')
                })
              } else {
                req.session.error = "후원사이트 이용자만 사용이 가능합니다."
                res.redirect('/')
              }
            })
          } else {
            var options = {
              groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "domain", korean: "연결할 도메인" }] } },
              savetojson: [],
              text: "연결 후 해당 도메인을 CNAME 레코드로 dev.rpgfarm.com에 연결하세요.<br>현재 연결 대상 사이트: https://baws.kr/" + rows[0]['go']
            }
            res.render('manage/edit', { data: data, rows: rows, help: help, options: options })
          }
        });

      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
