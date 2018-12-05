var SqlString = require('sqlstring')
var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')
var session_config = require('../../config/session')

module.exports = async (req, accessToken, refreshToken, profile, done) => {
  if(req.sqreen.userIsBanned(req)){
    req.session.error = '죄송합니다. 보안 시스템에 의하여 로그인이 거부되었습니다.'
    return done(null, false, { message: '죄송합니다. 보안 시스템에 의하여 로그인이 거부되었습니다.' })
  }

  var data = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=?", [profile.emails[0]['value']]))
  if(data.length ==  0) {
    var mail = profile.emails[0]['value']
    var svname = req.session.svname
    delete req.session.svname
    if(svname != undefined) {
      var enc_mail = require('md5')(mail + session_config.secret)
      var date = new Date().toLocaleDateString()
      await sqlp(sql, SqlString.format("INSERT INTO users SET id=?, mail=?, password='Social Login', status=1, userdata=json_object('svname', ?, 'regdate', ?, 'ninfo', '', 'enc_mail', ?)", [mail, mail, svname, date, enc_mail]))
      req.session.error = 'Baw Service에 오신걸 환영합니다! '+mail+'로 회원가입되었습니다.'
      req.sqreen.signup_track({ username: mail })
      return done(null, {
        'id': mail,
        'mail': mail,
        'svname': svname,
        'md5mail': require('md5')(mail)
      })
    }
    req.session.error = '아직 회원가입되지 않은 계정입니다.'
    req.sqreen.auth_track(false, { username: mail })
    return done(null, false, { message: '아직 회원가입되지 않은 계정입니다.' })
  }

  req.session.error = data[0]['id'] + '로 로그인했습니다.'
  req.sqreen.auth_track(true, { username: data[0]['id'] })
  return done(null, {
    'id': data[0]['id'],
    'mail': data[0]['mail'],
    'svname': JSON.parse(data[0]['userdata'])['svname'],
    'md5mail': require('md5')(data[0]['mail'])
  })
}
