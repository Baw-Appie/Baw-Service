var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');
var request = require('request');
var rp = require('request-promise');
var vali = require('validator');
var socket_api = require('../../libs/socket_api')

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
    // 데이터 가져오고 검증
    var id = req.body.id
    var password = req.body.password
    var page = req.body.page
    var date = new Date().toLocaleDateString()
    var ip = req.ip
    if(id == undefined || id == ''){
      throw ('ID를 입력해주세요.')
    }
    if(password == undefined || password == ''){
      throw ('비밀번호를 입력해주세요.')
    }
    var pagedata_req = await sqlp(sql, SqlString.format('SELECT * FROM pages WHERE name=? and service=2', [page]))
    if(pagedata_req.length != 1) {
      throw ("정품인증 페이지가 없습니다.")
    }
    var pagedata = pagedata_req[0]
    var ownerdata_req = await sqlp(sql, SqlString.format('SELECT * FROM users WHERE id=?', [pagedata['owner']]));
    if(ownerdata_req.length != 1) {
      throw ("페이지 관리자가 없습니다.")
    }
    var ownerdata = ownerdata_req[0]
    try {
      var mojang_body = await rp.post({url: 'https://authserver.mojang.com/authenticate',  json: {agent: {name: "Minecraft",version: 1}, username: id, password: password}})
    } catch(err) {
      throw (JSON.parse(JSON.stringify(await require('node-google-translate-skidz')({text: err.error.errorMessage, source: 'en', target: 'ko'}))).translation)
    }
    if(!mojang_body.selectedProfile || !mojang_body.selectedProfile.name) {
      throw ("구매가 완료된 마인크래프트 계정을 찾을 수 없었습니다.")
    }
    var nick = mojang_body.selectedProfile.name
    if((await sqlp(sql, SqlString.format("SELECT * FROM service2 WHERE page=? AND nick=?", [page, nick]))).length != 0) {
      throw ("이미 정품인증되었습니다.")
    }
    await sqlp(sql, SqlString.format('INSERT INTO service2 values (NULL, ?, ?, ?, ?, ?, 0)', [pagedata['owner'], page, nick, date, ip]))
    var jsonpagedata = JSON.parse(pagedata['pagedata'])
    // 메일 알림
    if(jsonpagedata['mail_ok'] == 1) {
      var nodemailer = require('nodemailer');
      var transporter = require('../../libs/mail-promise');
      await transporter({
        from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
        to: ownerdata['mail'],
        subject: '[Baw Service] 새로운 정품인증 요청이 있습니다!',
        html: "<p>Baw Service에서 새로운 정품인증 요청이 있습니다!</p><p>정품인증 관리 사이트를 확인해주세요!</p><p><a href=\"https://"+server_settings.hostname+"/manage/2/view\">[Baw Service 정품인증 관리 사이트]</a></p><p>Powered by <a href='https://baws.kr/'>Baw Service</a></p>"
      })
    }
    if(jsonpagedata['auto_process'] == 1) {
      var api_req = await sqlp(sql, SqlString.format('select * from `api` WHERE id=?', [pagedata['owner']]))
      if(api_req.length == 1) {
        var api = api_req[0]
        var api_cmd = jsonpagedata['api_cmd'];
        api_cmd = api_cmd.replace("<player>", nick);
        if(api['api_type'] == "socket"){
          socket_api(api['api_port'], api['api_ip'], api['api_key']+';'+pagedata['owner']+';'+api_cmd);
        }
        if(api['api_type'] == "HTTP") {
          await sqlp(sql, (SqlString.format('insert into api2 values (?, ?, ?, ?, ?)', [ownerdata['id'], api['api_key'], page, nick, api_cmd])))
        }
      }
    }
    var msg = "정품인증에 성공했습니다!"
  } catch(err) {
      console.log(err)
      if(err instanceof Error) {
        var msg = "정품인증 시스템에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n("+err+")"
      } else {
        var msg = "정품인증에 실패했습니다! ("+err+")"
      }
    } finally {
      res.send('<script>alert("' + msg +'");history.go(-1);</script>')
  }
}
