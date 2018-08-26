var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
var socket_api = require('../../libs/socket_api')
function isset(text) {
  if(vali.isEmpty(text) == false) {
    return true;
  } else {
    return false;
  }
}

function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        var id = req.body.id
        var password = req.body.password
        var page = req.body.page
        var date = new Date().toLocaleDateString()
        var ip = req.ip
        if(id == undefined || id == ''){
          return reject('ID를 입력해주세요.')
        }
        if(password == undefined || password == ''){
          return reject('비밀번호를 입력해주세요.')
        }
        request.post({url: 'https://authserver.mojang.com/authenticate', json: {agent: {name: "Minecraft",version: 1}, username: id, password: password}}, function(error, response, body){
          var rdata = body
          if(rdata.error) {
            var translate = require('node-google-translate-skidz');
            translate({text: rdata.errorMessage, source: 'en', target: 'ko'}, function(result) {
              return reject(result.translation)
            });
          } else if(rdata.selectedProfile.name){
            var nick = rdata['selectedProfile']['name']
            /* */
            sql.query('SELECT * FROM pages WHERE name='+ SqlString.escape(page)+' and service=2', function(err, rows) {
              if (err) { return reject('1번 질의 오류') }
              if (rows.length == 0) { return reject('정품인증 페이지가 존재하지 않습니다.') }
              sql.query('SELECT * FROM users WHERE id='+ SqlString.escape(rows[0]['owner']), function(err, rows2) {
                if (err) { return reject('2번 질의 오류') }
                sql.query('SELECT * FROM service2 WHERE nick='+SqlString.escape(nick)+' and page='+ SqlString.escape(page), function (err, rows5) {
                  if(err){ return reject('5번 질의 오류') }
                  if(rows5.length != 0){
                    return reject('이미 인증되었습니다.')
                  }
                })
                sql.query('SELECT * FROM service2 ORDER BY `num` ASC', function(err, rows3) {
                  if (err) { return reject('3번 질의 오류') }
                  var counter = rows3.length;
                  rows3.forEach(function(item) {
                    counter -= 1;
                    if ( counter === 0){
                      var no = item.num + 1
                      var sql_Request = SqlString.format('INSERT INTO service2 values (?, ?, ?, ?, ?, ?, 0)', [no, rows[0]['owner'], page, nick, date, ip]);
                      var sql_req4  = sql.query(sql_Request, function(err, rows4) {
                        if (err) { return reject('4번 질의 오류'); }
                        var jsonpagedata = JSON.parse(rows[0]['pagedata'])
                        if(jsonpagedata['mail_ok'] == 1) {
                          var nodemailer = require('nodemailer');
                          var transporter = require('../../libs/mail_init');
                          var mailOptions = {
                            from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
                            to: rows2[0]['mail'],
                            subject: '[Baw Service] 새로운 정품 인증 요청이 있습니다!',
                            html: "<p>Baw Service에서 새로운 정품 인증 요청이 있습니다!</p><p>정품 인증 관리 사이트를 확인해주세요!</p><p><a href=\"https://"+req.hostname+"/manage/2/view\">[Baw Service 관리 사이트]</a></p><p>Powered by <a href='https://baws.kr/'>Baw Service</a></p>"
                          };
                          transporter.sendMail(mailOptions, function(error, info) {
                            transporter.close();
                            if(error) {
                              return reject('인증에 성공하였으나 알림 메일 발송 오류입니다. 정품 인증 완료 사실을 서버 관리자에게 직접 알려주세요.')
                            }
                          });
                        }
                        if(jsonpagedata['auto_process'] == 1){
                          if(rows8[0]['api_enable'] == 1) {
                            sql.query('select * from `pages` WHERE service=2 and owner='+SqlString.escape(req.user.id), function(err, rows3) {
                              if(err) { throw err };
                              var api_cmd = JSON.parse(rows[0]['pagedata'])['api_cmd'];
                              api_cmd = api_cmd.replace("<player>", nick);
                              if(rows8[0]['api_type'] == "socket"){
                                socket_api(rows8[0]['api_port'], rows8[0]['api_ip'], rows8[0]['api_key']+';'+rows2[0]['id']+';'+api_cmd, function(data){});
                              }
                              if(rows8[0]['api_type'] == "HTTP") {
                                sql.query(SqlString.format('insert into api2 values (?, ?, ?, ?, ?)', [rows2[0]['id'], rows8[0]['api_key'], page, nick, api_cmd]))
                              }
                            })
                          }
                        }

                        resolve("<script>alert('정품인증에 성공했습니다!');location.replace('https://"+req.hostname+"/"+page+"');</script>")
                      })
                    }
                  });
                })
              })
            })
          } else {
            return reject('구입이 완료된 마인크래프트 닉네임을 찾을 수 없습니다.')
          }
        });
      }
    });
  })
}

module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	res.send(text);
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
};
