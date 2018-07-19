var sql = require('../config/dbtool');
var server_settings = require('../config/server_settings');
var session_config = require('../config/session');
var SqlString = require('sqlstring');
var crypto = require('crypto');
var request = require('request');
var nodemailer = require('nodemailer');
var transporter = require('./mail_init');

module.exports = function(id, mail, action, action_korean){
  return new Promise(function (resolve, reject) {
    var date = new Date()
    var expiry = new Date(new Date().getTime() + 1000*10*60);
    var code = require('md5')(mail + session_config.secret + action + date)

    sql.query(SqlString.format('insert into actionmail set no=0, id=?, date=?, action=?, code=?, expiry=?', [id, date, action, code, expiry]), function(err, rows){
      if(err) { console.error(err) }
    })

    var mailOptions = {
      from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
      to: mail,
      subject: '[Baw Service] '+action_korean+'(을)를 위한 인증 메일입니다.',
      html: id+"님이 Baw Service에서 요청하신 링크는 다음과 같습니다.<br><br><a href=\"https://"+server_settings.hostname+"/action/"+code+"\">[인증하기]</a><br>또는 아래 링크를 직접 복사해서 접속하세요.<br><br>https://"+server_settings.hostname+"/action/"+code+"<br><br>감사합니다.<p>Powered by <a href='https://baws.kr/'>Baw Service</a></p>"
    };
    transporter.sendMail(mailOptions, function(error, info) {
      transporter.close();
      if(error) {
        return reject('메일 발송 오류입니다. 관리자에게 문의해주세요.')
      } else {
        return resolve('메일 발송에 성공했습니다.')
      }
    });

  })
}
