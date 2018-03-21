var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');
function isset(text) {
  if(vali.isEmpty(text) == false) {
    return true;
  } else {
    return false;
  }
}


module.exports = function(req, res) {
    var nick = req.body.nick
    var bal = req.body.bal
    var nname = req.body.nname
    var Combo = req.body.Combo
    if (Combo != "틴캐시") {
      var pin1 = req.body['pin1[]'][0]
      var pin2 = req.body['pin2[]'][0]
      var pin3 = req.body['pin3[]'][0]
      var pin4 = req.body['pin4[]']
    } else {
      var pin1 = req.body['pin1[]'][1]
      var pin2 = req.body['pin2[]'][1]
      var pin3 = req.body['pin3[]'][1]
    }
    var Radio = req.body.Radio
    var page = req.body.page
    var code = req.body.code
    var date = new Date().toLocaleDateString()
    var ip = req.connection.remoteAddress
    try {
      if(vali.isEmpty(nick)){
        throw new Error('닉네임을 입력해주세요.')
      }
      if(vali.isEmpty(bal)){
        throw new Error('후원금액을 입력해주세요.')
      }
      if(vali.isEmpty(Combo)){
        throw new Error('후원방법을 선택해주세요.')
      }
      if(Combo != "계좌이체") {
        if(vali.isEmpty(pin1)){
          throw new Error('핀번호1를 입력해주세요.')
        }
        if(vali.isEmpty(pin2)){
          throw new Error('핀번호2를 입력해주세요.')
        }
        if(vali.isEmpty(pin3)){
          throw new Error('핀번호3를 입력해주세요.')
        }
        if(Combo != "틴캐시") {
          if(vali.isEmpty(pin4)){
            throw new Error('핀번호4를 입력해주세요.')
          }
        }
      } else {
        if(vali.isEmpty(nname)) {
          throw new Error('입금자를 입력해주세요.')
        }
      }
      if(Combo == "틴캐시" || Combo == "도서문화상품권") {
        if(vali.isEmpty(code)){
          throw new Error('인증 번호(발행일)을 입력해주세요.')
        }
      }
    } catch(e) {
      res.send('<script>alert("' + e.stack +'");history.go(-1);</script>')
    }

    try {
      var sql_req = sql('SELECT * FROM page WHERE name='+ SqlString.escape(page)+' and service=1', function(err, rows) {
        if (err) { throw new Error('1번 질의 오류') }
        if (rows.length == 0) { throw new Error('후원 홈페이지가 존재하지 않습니다.') }
        var sql_req2 = sql('SELECT * FROM id WHERE id='+ SqlString.escape(rows[0]['owner']), function(err, rows2) {
          if (err) { throw new Error('2번 질의 오류') }
          var sql_req3 = sql('SELECT * FROM service1 ORDER BY `num` ASC', function(err, rows3) {
            if (err) { throw new Error('3번 질의 오류') }
            var counter = rows3.length;
            rows3.forEach(function(item) {
                counter -= 1;
                if ( counter === 0){
                  var no = item.num + 1
                  if(Combo == "틴캐시"){
          	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?-?-?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pin1, pin2, pin3, Combo, code, Radio, ip, date]);
                   } else if (Combo == "계좌이체") {
             	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, "없음", ?, ?, ?, ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, Combo, code, nname, Radio, ip, date]);
                   } else {
           	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?-?-?-?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pin1, pin2, pin3, pin4, Combo, code, Radio, ip, date]);
                   }
                  var sql_req4  = sql(sql_Request, function(err, rows4) {
                    if (err) { throw new Error('4번 질의 오류'); }
                    res.send("<script>alert('등록되었습니다.');location.replace('https://"+req.hostname+"/"+page+"');</script>")
                  })
                }
            });
          })
        })
      })
    } catch(e) {
    res.send('<script>alert("' + e.stack +'");history.go(-1);</script>')
  }
};
