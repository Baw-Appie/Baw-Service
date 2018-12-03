var sql = require('../config/dbtool')
var server_settings = require('../config/server_settings')
var session_config = require('../config/session')
var SqlString = require('sqlstring')
var sqlp = require('./sql-promise')

module.exports = (id, mail, action, action_korean) => {
  return new Promise((resolve, reject) => {
    var date = new Date()
    var expiry = new Date(new Date().getTime() + 1000*10*60);
    var code = require('md5')(mail + session_config.secret + action + date)

    sqlp(sql, (SqlString.format('insert into actionmail set no=0, id=?, date=?, action=?, code=?, expiry=?', [id, date, action, code, expiry])))

    var sendgrid = require('./sendgrid')
    sendgrid.send({
      from: 'Baw Service <services@baws.kr>',
      to: mail,
      templateId: server_settings.sendgrid_action_request_template,
      dynamic_template_data: {
        subject: action_korean+'(을)를 위한 인증 메일입니다.',
        header: action_korean,
        text: "안녕하세요. "+id+"님!, Baw Service에서 요청한 "+action_korean+"(을)를 완료하려면 아래의 인증하기 버튼을 클릭해주세요!",
        c2a_link: 'https://'+server_settings.hostname+'/action/'+code,
        c2a_button: "인증하기"
      },
    })
    return resolve('메일 발송을 요청했습니다.')

  })
}
