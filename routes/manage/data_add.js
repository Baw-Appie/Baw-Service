var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')
var server_settings = require('../../config/server_settings')
var SqlString = require('sqlstring')
var request = require('request')
var vali = require('validator')

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
  if(req.params.service == 1){
    await Recaptcha(req)
    var { nick, bal, nname, method, bouns, code, pin, date, ip, status } = req.body
    if(vali.isEmpty(nick) || nick.length > 18){
      throw ('닉네임을 입력해주세요.')
    }
    if(vali.isEmpty(bal) || bal.length > 18){
      throw ('후원금액을 입력해주세요.')
    }
    if(vali.isEmpty(method) || method.length > 18){
      throw ('후원방법을 입력해주세요.')
    }
    if(vali.isEmpty(pin) || pin.length > 22){
      throw ('핀번호를 입력해주세요.')
    }
    if(vali.isEmpty(nname)) {
      throw ('입금자를 입력해주세요.')
    }
    if(vali.isEmpty(bouns)) {
      throw ('후원 보너스를 입력해주세요.')
    }
    if(vali.isEmpty(ip) || ip.length > 18) {
      throw ('입금자를 입력해주세요.')
    }
    if(vali.isEmpty(code) || code.length > 18){
      throw ('인증 번호(발행일)을 입력해주세요.')
    }
    if(status != 0 && status !=  1 && status !=  2){
      throw ('처리 상태를 제대로 선택해주세요.')
    }
    var pagedata_req = await sqlp(sql, SqlString.format('SELECT * FROM pages WHERE owner=? and service=1', [req.user.id]))
    if(pagedata_req.length != 1) {
      throw ("후원 홈페이지가 없습니다.")
    }
    var pagedata = pagedata_req[0]
    var ownerdata_req = await sqlp(sql, SqlString.format('SELECT * FROM users WHERE id=?', [req.user.id]));
    if(ownerdata_req.length != 1) {
      throw ("페이지 관리자가 없습니다.")
    }

    var a = { bal: bal, pin: pin, method: method, code: code, nname: nname, bouns: bouns }
    var sql_Request = SqlString.format('INSERT INTO service values (NULL, ?, ?, 1, ?, ?, ?, ?, ?)', [pagedata.name, req.user.id, nick, date, ip, status, JSON.stringify(a)])
    try { await sqlp(sql, sql_Request) } catch(e) { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다." }) }
    res.json({ success: true, title: "완료했습니다!", message: "등록되었습니다."});
  }
}
