var SqlString = require('sqlstring')
var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')

module.exports = async (req, accessToken, refreshToken, profile, done) => {
  if(req.sqreen.userIsBanned(req)){
    req.session.error = '죄송합니다. 보안 시스템에 의하여 로그인이 거부되었습니다.'
    return done(null, false, { message: '죄송합니다. 보안 시스템에 의하여 로그인이 거부되었습니다.' })
  }

  var data = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=? OR mail=?", [profile.emails[0]['value'], profile.emails[0]['value']]))
  if(data.length ==  0) {
    // TODO: 구글 계정으로 회원가입 추가
    req.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.'
    req.sqreen.auth_track(false, { username: profile.emails[0]['value'] })
    return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
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
