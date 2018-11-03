var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var session_config = require('../../config/session');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
var sqlp = require('../../libs/sql-promise');

function Recaptcha(req) {
  return new Promise(function (resolve, reject) {
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl, function (error, response, body) {
      body = JSON.parse(body);
      if (body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        resolve("성공했습니다.")
      }
    });
  })
}

module.exports = async (req, res) => {
  if(req.query.social != undefined) {
    var { svname } = req.body
    console.log(svname)
    if (svname == undefined || vali.isEmpty(svname)) {
      req.session.error = "서버 이름을 입력해주세요."
      return res.redirect('/auth/register')
    }
    req.session.svname = svname
    return res.redirect('/auth/'+req.query.social)
  }

  try {
    await Recaptcha(req)

    var { id, pass, pass2, mail, svname } = req.body
    var date = new Date().toLocaleDateString()
    if (vali.isEmpty(id)) {
      throw ('ID를 입력해주세요.')
    }
    if (vali.isEmpty(pass)) {
      throw ('비밀번호를 입력해주세요.')
    }
    if (vali.isEmpty(pass2)) {
      throw ('비밀번호 확인을 입력해주세요.')
    }
    if (vali.isEmail(mail) == false) {
      throw ('이메일을 입력해주세요.')
    }
    if (vali.isEmpty(svname)) {
      throw ('서버 이름을 입력해주세요.')
    }
    if (pass != pass2) {
      throw ('비밀번호가 비밀번호 확인과 일치하지 않습니다.')
    }
    if ((await sqlp(sql, SqlString.format("SELECT id FROM users WHERE id=? OR mail=?", [id, mail]))).length == 1) {
      throw '이미 존재하는 아이디 또는 이메일입니다.'
    }
    var enc_mail = require('md5')(mail + session_config.secret)
    var sql_Request = SqlString.format("INSERT INTO users SET id=?, mail=?, password=password(?), status=0, userdata=json_object('svname', ?, 'regdate', ?, 'ninfo', '', 'enc_mail', ?)", [id, mail, pass, svname, date, enc_mail])
    try { await sqlp(sql, sql_Request) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }

    var transporter = require('../../libs/mail-promise')
    await transporter({
      from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
      to: mail,
      subject: '[Baw Service] 가입 확인 이메일입니다.',
      html: '유저님이 Baw Service에서 요청하신 링크는 다음과 같습니다.<br><br><a href=\"https://' + req.hostname + '/auth/check-email?key=' + enc_mail + '">[인증하기]</a><br>또는 아래 링크를 직접 복사해서 접속하세요.<br><br>https://' + req.hostname + '/auth/check-email?key=' + enc_mail + '<br><br>감사합니다.'
    })
    req.sqreen.signup_track({ username: id })
    var msg = "Baw Service에서 인증 메일을 보냈습니다. 인증 메일을 확인해주세요."

  } catch (err) {
    if (err instanceof Error) {
      console.log(err)
      var msg = "회원가입에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. (" + err + ")"
    } else {
      var msg = "회원가입에 실패했습니다! (" + err + ")"
    }
  } finally {
    req.session.error = msg
    return res.redirect('/auth/register')
  }
}
