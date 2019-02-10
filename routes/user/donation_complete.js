var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');
var request = require('request');
var rp = require('request-promise');
var vali = require('validator');
var crypto = require('crypto');
var dataWorker = require('../../libs/dataWorker')

function Recaptcha(req){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        resolve("성공했습니다.")
      }
    });
  })
}

module.exports = async (req, res) => {
  try {
    // 리캡차 확인
    await Recaptcha(req)

    // 페이지 데이터 가져옴
    var { nick, bal, nname, Combo, Radio, page, code, email } = req.body
    if (Combo != "틴캐시") {
      var [ pin1, pin2, pin3, pin4 ] = [req.body.pin1[0], req.body.pin2[0], req.body.pin3[0], req.body.pin4]
    } else {
      var [ pin1, pin2, pin3 ] = [req.body.pin1[1], req.body.pin2[1], req.body.pin3[1]]
    }
    var date = new Date().toLocaleDateString()
    var ip = req.ip
    if(vali.isEmpty(nick) || nick.length > 18){
      throw ('닉네임을 입력해주세요.')
    }
    if(vali.isEmpty(bal) || bal.length > 18){
      throw ('후원금액을 입력해주세요.')
    }
    if(vali.isEmpty(Combo) || Combo.length > 18){
      throw ('후원방법을 선택해주세요.')
    }
    if(Combo != "계좌이체") {
      if(vali.isEmpty(pin1) || pin1.length != 4){
        throw ('핀번호1를 입력해주세요.')
      }
      if(vali.isEmpty(pin2) || pin2.length != 4){
        throw ('핀번호2를 입력해주세요.')
      }
      if(vali.isEmpty(pin3) || pin3.length != 4){
        throw ('핀번호3를 입력해주세요.')
      }
      if(Combo != "틴캐시") {
        if(vali.isEmpty(pin4) || pin1.length > 6 || pin4.length < 3 || pin4.length == 5){
          throw ('핀번호4를 입력해주세요.')
        }
      }
    } else {
      if(vali.isEmpty(nname)) {
        throw ('입금자를 입력해주세요.')
      }
    }
    if(Combo == "해피머니" || Combo == "도서문화상품권") {
      if(vali.isEmpty(code) || code.length > 18){
        throw ('인증 번호(발행일)을 입력해주세요.')
      }
    } else {
      var code = "없음"
    }

    var pagedata_req = await sqlp(sql, SqlString.format('SELECT * FROM pages WHERE name=? and service=1', [page]))
    if(pagedata_req.length != 1) {
      throw ("후원 홈페이지가 없습니다.")
    }
    var pagedata = pagedata_req[0]
    var ownerdata_req = await sqlp(sql, SqlString.format('SELECT * FROM users WHERE id=?', [pagedata['owner']]));
    if(ownerdata_req.length != 1) {
      throw ("페이지 관리자가 없습니다.")
    }
    var ownerdata = ownerdata_req[0]

    if(Combo == "틴캐시") {
      var pincode = pin1+'-'+pin2+'-'+pin3
      var nname = "없음"
    } else if(Combo == "계좌이체") {
      var pincode = "없음"
    } else {
      var pincode = pin1+'-'+pin2+'-'+pin3+'-'+pin4
      var nname = "없음"
    }
    var a = { bal, pin: pincode, method: Combo, code, nname, bouns: Radio }
    if(typeof email != "undefined") {
      a.email = email
    }
    
    var insert = await sqlp(sql, SqlString.format('INSERT INTO service values (NULL, ?, ?, 1, ?, NOW(), ?, 0, ?)', [page, pagedata['owner'], nick, ip, JSON.stringify(a)]))
    var jsonpagedata = JSON.parse(pagedata['pagedata'])
    // 자동 충전
    if(Combo == "문화상품권") {
      var cland_req = await sqlp(sql, SqlString.format("SELECT * FROM AutoCharge WHERE id=?", [pagedata['owner']]))
      if(cland_req.length == 1) {
        var cland = cland_req[0]
        var charge = await rp.post({ url: server_settings.autocharge_server, form: { p1: pin1, p2: pin2, p3: pin3, p4: pin4, id: cland['cland_id'], pw: cland['cland_pass'], c: server_settings.autocharge_key }})
        if(JSON.parse(charge).success == true) {
          await dataWorker(pagedata['owner'], insert.insertId, 1, 1, undefined)
        }
      }
    }


    // 메일 알림
    var sendgrid = require('../../libs/sendgrid')
    if(typeof email != "undefined") {
      sendgrid.send({
        from: 'Baw Service <services@baws.kr>',
        to: email,
        templateId: server_settings.sendgrid_request_complete_template,
        dynamic_template_data: {
          header: "후원이 성공적으로 신청되었습니다.",
          nickname: nick,
        	svname: JSON.parse(ownerdata['userdata'])['svname']+"서버",
        	action: "후원"
        },
      })
    }

    if(jsonpagedata['mail_ok'] == 1) {
      sendgrid.send({
        from: 'Baw Service <services@baws.kr>',
        to: ownerdata['mail'],
        templateId: server_settings.sendgrid_action_request_template,
        dynamic_template_data: {
          subject: '새로운 후원 요청이 있습니다!',
        	header: "새로운 후원 요청",
        	text: "Baw Service에서 후원 요청을 받았습니다! 지금 후원 관리 페이지로 접속하여 후원을 확인해주세요.",
        	c2a_link: 'https://'+server_settings.hostname+'/manage/1/view',
        	c2a_button:"후원 관리 페이지"
        },
      })
    }
    // 문자 알림
    if(jsonpagedata['sms_ok'] == 1) {
      var sms_req = await sqlp(sql, SqlString.format('SELECT * FROM sms WHERE send=0 AND id=?', [pagedata['owner']]))
      if(sms_req.length == 1){
        var sms = sms_req[0]
        var formdata = {data: JSON.stringify({id: server_settings.sms_id, pw: crypto.createHash('sha256').update(server_settings.sms_pw).digest('hex'), code: '5325', type: 'A', caller: server_settings.sms_caller, toll: sms['phone'], html: '1'}), msg: '새로운 후원이 있습니다! https://baws.kr'}
        var sms_body = await rp.post({url: 'http://smsapi.dotname.co.kr/index.php', form: formdata})
        await sqlp(sql, SqlString.format('update sms set send = send+1 where id = ?', [pagedata['owner']]))
        if(sms_body != "@1"){
          console.log(sms_body)
          throw ('후원 등록에는 성공하였으나 알림 문자 전송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
        }
      }
    } else {
      // 카톡 알림 (SMS 비활성화시)
      if(jsonpagedata['kakao_ok'] == 1) {
        var katalk_req = await sqlp(sql, SqlString.format('SELECT * FROM katalk WHERE send=0 AND id=?', [pagedata['owner']]))
        if(katalk_req.length == 1) {
          var katalk = katalk_req[0]
          var formdata = {
            api_key: server_settings.katalk_api_key,
            template_code: server_settings.katalk_donation_template,
            variable: JSON.parse(ownerdata['userdata'])['svname']+"서버|"+Radio+"|"+Radio+"|"+nick+"|"+date+"|"+bal+"|https://baws.kr/contact",
            // variable: JSON.parse(ownerdata['userdata'])['svname']+"서버|"+Radio+"|"+Radio+"|"+nick+"|"+date+"|"+bal+"|"+date,
            callback: server_settings.katalk_caller,
            dstaddr: katalk['phone'],
            next_type: 0,
            send_reserve: 0
          }
          var katalk_body = await rp.post({url: 'http://'+server_settings.katalk_server+'/API/alimtalk_api', form: formdata})
          await sqlp(sql, SqlString.format('update katalk set send = send+1 where id = ?', [pagedata['owner']]))
          console.log(katalk_body)
          if(JSON.parse(katalk_body).result != "100"){
            throw ('후원 등록에는 성공하였으나 알림 카톡 전송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
          }
        }
      }
    }
    // 텔레그램 알림
    if(jsonpagedata['tg_ok'] == 1) {
      var tg_req = await sqlp(sql, SqlString.format('SELECT * FROM telegram WHERE id=?', [pagedata['owner']]))
      if(tg_req.length == 1) {
        var tg = tg_req[0]
        var tg_body = await rp('https://api.telegram.org/bot'+server_settings.tg_bot_key+'/getChat?chat_id='+tg['chat_id'])
        if(JSON.parse(tg_body).ok == true){
          const { TelegramClient } = require('messaging-api-telegram');
          const client = TelegramClient.connect(server_settings.tg_bot_key);
          client.sendMessage(tg['chat_id'], nick+'님의 '+Combo+' '+bal+'원 후원을 지금 Baw Service에서 확인하세요! https://baws.kr');
        }
      }
    }
    // 웹 푸쉬 알림
    if(jsonpagedata['browser_ok'] == 1) {
      var browser_req = await sqlp(sql, SqlString.format('SELECT * FROM fcm WHERE id=?', [pagedata['owner']]))
      if(browser_req.length != 0){
        var admin = require('firebase-admin')
        browser_req.forEach(async (value) => {
          admin.messaging().send({
            webpush: {
              notification: {
                title: '새로운 후원이 있습니다.',
                body: nick+'님의 '+Combo+' '+bal+'원 후원을 지금 Baw Service에서 확인하세요!',
                icon: 'https://baws.kr/public/img/favicon.jpg',
                click_action: 'https://baws.kr/manage/1/view'
              }
            },
            token: value.token
          }).catch(() => {
            sqlp(sql, SqlString.format('DELETE FROM `fcm` WHERE token=?', [value.token]))
          })
        })
      }
    }
    var msg = "후원 요청이 완료되었습니다."

  } catch(err) {
    console.log(err)
    if(err instanceof Error) {
      var msg = "후원 시스템에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n("+err+")"
    } else {
      var msg = "후원에 실패했습니다! ("+err+")"
    }
  } finally {
    res.send('<script>alert("' + msg +'");history.go(-1);</script>')
  }
};
