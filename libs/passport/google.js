var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var passport = require('passport');
module.exports = function(request, accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    var login_req = sql.query('select * from users where id=' + SqlString.escape(profile.emails[0]['value']), function(err, rows){
      if(err) { done(err) };
      if (rows.length === 0) {
        request.session.error = '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.';
        return done(null, false, { message: '존재하지 않는 ID거나 비밀번호를 잘못 입력하셨습니다.' })
      } else {
        request.session.error = rows[0].id + '로 로그인했습니다.';
        return done(null, {
          'id': rows[0]['id'],
          'mail': rows[0]['mail'],
          'svname': rows[0]['svname'],
          'md5mail': require('md5')(rows[0]['mail'])
        });
      }
    });
  });
}
