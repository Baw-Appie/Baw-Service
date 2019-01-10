var sql = require('../../config/dbtool')
var sqlp = require('../sql-promise')
var SqlString = require('sqlstring')

module.exports = async (req, username, password, done) => {
  if(req.sqreen.userIsBanned(req)){
    req.session.error = '보안 시스템에 의하여 로그인이 거부되었습니다.';
    return done(null, false, { message: '보안 시스템에 의하여 로그인이 거부되었습니다.' })
  }
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
  return done(null, {
    'id': username,
    'mail': data[0]['mail'],
    'svname': JSON.parse(data[0]['userdata'])['svname'],
    'md5mail': require('md5')(data[0]['mail'])
  });
}
