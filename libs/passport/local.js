var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var passport = require('passport');
module.exports = function (req, username, password, done) {
  if(req.sqreen.userIsBanned(req)){
    req.session.error = '보안 시스템에 의하여 로그인이 거부되었습니다.';
    return done(null, false, { message: '보안 시스템에 의하여 로그인이 거부되었습니다.' })
  }
  sql.query('select * from users where id=' + SqlString.escape(username) + ' and password=password(' + SqlString.escape(password) + ')', function(err, rows){
    if(err) { done(err) };
    if (rows.length === 0) {
      req.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
      req.sqreen.auth_track(false, { username: username });
      return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
    } else {
      if(rows[0].status == 0){
        req.session.error = '이메일 인증이 필요합니다. 메일함을 확인하거나 카카오톡 pp121324로 문의하세요.';
        req.sqreen.auth_track(false, { username: username });
        return done(null, false, { message: '이메일 인증이 필요합니다. 메일함을 확인하거나 카카오톡 pp121324로 문의하세요.' })
      }
      req.session.error = rows[0].id + '로 로그인했습니다.';
      req.sqreen.auth_track(true, { username: username });
      return done(null, {
        'id': username,
        'mail': rows[0]['mail'],
        'svname': JSON.parse(rows[0]['userdata'])['svname'],
        'md5mail': require('md5')(rows[0]['mail'])
      });
    }
  });
}
