var sql = require('../../config/dbtool')
var sqlp = require('../sql-promise')
var SqlString = require('sqlstring')
var bcrypt = require('bcrypt')

module.exports = async (req, username, password, done) => {
  if(req.sqreen.userIsBanned(req)){
    req.session.error = '보안 시스템에 의하여 로그인이 거부되었습니다.';
    return done(null, false, { message: '보안 시스템에 의하여 로그인이 거부되었습니다.' })
  }

  // NEW PASSWORD LOGIN!
  var data = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=?", [username]))
  if(data.length == 1 && data[0]['password'].substr(0,1) != "*") {
    if(await bcrypt.compare(password, data[0]['password'])) {
      if(data[0].status == 0) {
        req.session.error = '이메일 인증이 완료되지 않았습니다. 메일함을 확인해보세요!'
        req.sqreen.auth_track(false, { username: username });
        return done(null, false, { message: '이메일 인증이 완료되지 않았습니다. 메일함을 확인해보세요!' })
      }
      req.session.error = '새로운 비밀번호 암호화 방식을 이용하여 '+JSON.parse(data[0].userdata).svname+'서버로 로그인했습니다.'
      return done(null, {
        'id': username,
        'mail': data[0]['mail'],
        'svname': JSON.parse(data[0]['userdata'])['svname'],
        'md5mail': require('md5')(data[0]['mail'])
      });
    } else {
      req.session.error = '존재하지 않는 계정이거나, 비밀번호를 잘못 입력했습니다.'
      req.sqreen.auth_track(false, { username: username });
      return done(null, false, { message: '존재하지 않는 계정이거나, 비밀번호를 잘못 입력했습니다.' })
    }
  }

  // OLD PASSWORD CHANGE!
  var data = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=? AND password=password(?)", [username, password]))
  if(data.length == 0) {
    req.session.error = '존재하지 않는 계정이거나, 비밀번호를 잘못 입력했습니다.'
    req.sqreen.auth_track(false, { username: username });
    return done(null, false, { message: '존재하지 않는 계정이거나, 비밀번호를 잘못 입력했습니다.' })
  }
  if(data[0].status == 0) {
    req.session.error = '이메일 인증이 완료되지 않았습니다. 메일함을 확인해보세요!'
    req.sqreen.auth_track(false, { username: username });
    return done(null, false, { message: '이메일 인증이 완료되지 않았습니다. 메일함을 확인해보세요!' })
  }
  req.session.error = JSON.parse(data[0].userdata).svname+'서버로 로그인했습니다.'
  req.sqreen.auth_track(true, { username: username });
  if(data[0]['password'].substr(0,1) == "*") {
    var hash = await bcrypt.hash(password, 10)
    await sqlp(sql, SqlString.format("UPDATE users SET password=? WHERE id=?", [hash, username]))
    req.session.error = JSON.parse(data[0].userdata).svname+'서버로 로그인했습니다. Baw Service가 자동으로 더 안전한 비밀번호 암호화 방식으로 변경했습니다.'
  }
  return done(null, {
    'id': username,
    'mail': data[0]['mail'],
    'svname': JSON.parse(data[0]['userdata'])['svname'],
    'md5mail': require('md5')(data[0]['mail'])
  });
}
