var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');

module.exports = async (req, res) => {
  if(req.user) {
    var {service} = req.params
    if(service == "API") {
      var data = {"name": "API 플러그인"}
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
        <button class="ui button icon labeled negative" type="button" onclick="input_Text()"><i class="icon far fa-redo"></i> API 키  재설정</button>
        <div class="ui buttons"><a target="_blank" href="https://links.rpgfarm.com/c"><button type="button" class="ui button">Socket형 API 플러그인 다운로드 (v1.0)</button></a><div class="or"></div><a target="_blank" href="https://links.rpgfarm.com/d"><button type="button" class="ui button">HTTP형 API 플러그인 다운로드 (v1.0)</button></a></div><br>`
      }
      var help = "openlink:https://baw-service.tistory.com/43"

      var rows = await sqlp(sql, SqlString.format("SELECT * FROM api WHERE id=?", [req.user.id]))
      if(rows.length == 0) {
        await sqlp(sql, SqlString.format("INSERT INTO api SET id=?, api_enable=0, api_key='', api_ip='', api_port=3203, api_type='HTTP'", [req.user.id]))
        var rows = await sqlp(sql, SqlString.format("SELECT * FROM api WHERE id=?", [req.user.id]))
      }
      res.render('manage/edit', { data, rows, help, options })
    } else if(service == "SMS") {
      var data = {"name": "SMS 알림"}
      var options = {
        groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "phone", korean: "전화번호" }] } },
        savetojson: [],
        text: `<p>SMS 부가 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 사용하려면 후원 사이트 수정에서 SMS 알림이 켜져있다면 꺼주세요.</p>`
      }

      var rows = await sqlp(sql, SqlString.format("SELECT * FROM sms WHERE id=?", [req.user.id]))
      if(rows.length == 0) {
        await sqlp(sql, SqlString.format("INSERT INTO sms values (?, '010-0000-0000', 0, 0)", [req.user.id]))
        var rows = await sqlp(sql, SqlString.format("SELECT * FROM sms WHERE id=?", [req.user.id]))
      }
      res.render('manage/edit', { data, rows, options })
    } else if(service == "Kakao") {
      var data = {"name": "카카오톡 알림"}
      var options = {
        groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "phone", korean: "전화번호" }] } },
        savetojson: [],
        text: `<p>카카오톡 알림 서비스의 전화번호는 수정할 수 없습니다. 수정하려면 카카오톡 고객센터 @b_noti로 알려주세요.</p><p>만약 SMS 알림 서비스를 이용하면 카카오톡 알림은 전송되지 않습니다.</p><p>카카오톡 알림 서비스를 이용하려면 후원 사이트에서 SMS 알림이 켜져있다면 꺼주세요.</p><p>SMS 서비스와 동일하게 10분당 1회만 전송됩니다.</p>`,
        do_not_save: true
      }

      var rows = await sqlp(sql, SqlString.format("SELECT * FROM katalk WHERE id=?", [req.user.id]))
      if(rows.length == 0) {
        return res.send('<script>$.pjax({url: "/secuity/allow_katalk", container: "#contents"})</script>')
      }
      res.render('manage/edit', { data, rows, options })

    } else if(service == "Telegram") {
      var data = {"name": "Telegram 알림"}
      var options = {
        groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "chat_id", korean: "채팅방 ID" }] } },
        savetojson: []
      }
      var help = `<p>Telegram에서 @BawServiceBot을 검색 후 시작해서 채팅방 ID를 클릭하여 채팅방 ID를 가져올 수 있습니다.</p>`

      var rows = await sqlp(sql, SqlString.format("SELECT * FROM telegram WHERE id=?", [req.user.id]))
      if(rows.length == 0) {
        await sqlp(sql, SqlString.format('INSERT INTO telegram values (?, "")', [req.user.id]))
        var rows = await sqlp(sql, SqlString.format("SELECT * FROM telegram WHERE id=?", [req.user.id]))
      }
      res.render('manage/edit', { data, rows, options })

    } else if(service == "Custom") {
      var data = { "name": "커스텀 도메인" }

      var rows = await sqlp(sql, SqlString.format("SELECT * FROM custom_domain WHERE owner=?", [req.user.id]))
      if(rows.length == 0) {
        var donation = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=0 AND owner=?", [req.user.id]))
        if(donation.length == 0) {
          await sqlp(sql, SqlString.format('INSERT INTO `custom_domain` VALUES (NULL, ?, NOW(), "example.com", ?, 1);', [req.user.id, donation[0]['name']]))
          var rows = await sqlp(sql, SqlString.format("SELECT * FROM custom_domain WHERE owner=?", [req.user.id]))
        } else {
          req.session.error = "후원사이트 이용자만 사용이 가능합니다."
          return res.redirect('/')
        }
      }
      var options = {
        groups: { general: { korean: "일반", description: "외부서비스 통합 설정", text: [{ name: "domain", korean: "연결할 도메인" }] } },
        savetojson: [],
        text: "연결 후 해당 도메인을 CNAME 레코드로 dev.rpgfarm.com에 연결하세요.<br>현재 연결 대상 사이트: https://baws.kr/" + rows[0]['go']
      }
      res.render('manage/edit', { data, rows, options })

    } else {
      res.render('error/403')
    }
  } else {
    res.redirect('/auth/login')
  }
}
