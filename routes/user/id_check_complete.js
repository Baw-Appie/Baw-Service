var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
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
      reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        var id = req.body.id
        var password = req.body.password
        var page = req.body.page
        var date = new Date().toLocaleDateString()
        var ip = req.connection.remoteAddress
        if(id == undefined || id == ''){
          reject('ID를 입력해주세요.')
        }
        if(password == undefined || password == ''){
          reject('비밀번호를 입력해주세요.')
        }
        request.post({url: 'https://authserver.mojang.com/authenticate', json: {agent: {name: "Minecraft",version: 1}, username: id, password: password}}, function(error, response, body){
          var rdata = body
          if(rdata.error) {
            var translate = require('node-google-translate-skidz');
            translate({text: rdata.errorMessage, source: 'en', target: 'ko'}, function(result) {
              // reject('메롱')
              reject(result.translation)
            });
          } else if(rdata.selectedProfile.name){
            var nick = rdata['selectedProfile']['name']
            /* */
            var sql_req = sql('SELECT * FROM page WHERE name='+ SqlString.escape(page)+' and service=2', function(err, rows) {
              if (err) { reject('1번 질의 오류') }
              if (rows.length == 0) { reject('정품인증 페이지가 존재하지 않습니다.') }
              var sql_req2 = sql('SELECT * FROM id WHERE id='+ SqlString.escape(rows[0]['owner']), function(err, rows2) {
                if (err) { reject('2번 질의 오류') }
                var sql_req5 = sql('SELECT * FROM service2 WHERE nick='+SqlString.escape(nick)+' and page='+ SqlString.escape(page), function (err, rows5) {
                  if(err){ reject('5번 질의 오류') }
                  if(rows5.length != 0){
                    reject('이미 인증되었습니다.')
                  }
                })
                var sql_req3 = sql('SELECT * FROM service2 ORDER BY `num` ASC', function(err, rows3) {
                  if (err) { reject('3번 질의 오류') }
                  var counter = rows3.length;
                  rows3.forEach(function(item) {
                    counter -= 1;
                    if ( counter === 0){
                      var no = item.num + 1
                      var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?, 0)', [no, rows[0]['owner'], page, nick, date, ip]);
                      console.log(sql_Request)
                      var sql_req4  = sql(sql_Request, function(err, rows4) {
                        if (err) { reject('4번 질의 오류'); }
                        resolve("<script>alert('등록되었습니다.');location.replace('https://"+req.hostname+"/"+page+"');</script>")
                      })
                    }
                  });
                })
              })
            })
            /* */
          } else {
            reject('구입이 완료된 마인크래프트 닉네임을 찾을 수 없습니다.')
          }
        });
      }
    });
  })
}

module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	console.log(text);
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
};
