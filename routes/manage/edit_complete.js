var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');

function req_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined || req.body[item] == ""){
        reject(true)
      }
    })
    resolve(true)
  })
}
function opt_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined){
        reject(true)
      }
    })
    resolve(true)
  })
}

module.exports = function(req, res) {
    if(req.user || req.params.service == 1 || 2 || 3) {
        var req_field = []
        var opt_field = ["notice"]
        var service = req.params.service;
      	var notice = req.body.notice;
        if(service == 1){
          req_field.push("theme", "bouns", "sms_ok", "tg_ok", "kakao_ok")
          opt_field.push("youtube", "lookup_ok")
      		var lookup_ok = req.body.lookup_ok;
      		var youtube = req.body.youtube;
          if(req.body.disabled == undefined) {
            var disabled = ""
          } else {
            opt_field.push("disabled")
            var disabled = req.body.disabled.toString()
          }
      		var theme = req.body.theme;
      		var bouns = req.body.bouns;
      		var sms_ok = req.body.sms_ok;
      		var tg_ok = req.body.tg_ok;
      		var kakao_ok = req.body.kakao_ok;
        }
        if(service == 1 || service  == 2){
          req_field.push("mail_ok")
          opt_field.push("api_cmd")
      		var mail_ok = req.body.mail_ok;
      		var api_cmd = req.body.api_cmd;
        }
        if(service == 2){
          req_field.push("auto_process")
      		var auto_process = req.body.auto_process;
        }
        if(service == 3){
          req_field.push("sv_ip", "sv_port")
      		var sv_ip = req.body.sv_ip;
      		var sv_port = req.body.sv_port;
        }

        req_check(req_field, req).then(function (text) {
          opt_check(opt_field, req).then(function (text) {
            if(req.params.service == 1) {
              var sql_Request = SqlString.format('UPDATE `pages` SET pagedata=json_set(pagedata, "$.mail_ok", ?, "$.bouns", ?, "$.sms_ok", ?, "$.kakao_ok", ?, "$.tg_ok", ?, "$.api_cmd", ?, "$.disabled", ?, "$.youtube", ?, "$.lookup_ok", ?), `notice`=?, `theme`=? WHERE service=1 and owner=?', [mail_ok, bouns, sms_ok, kakao_ok, tg_ok, api_cmd, disabled, youtube, lookup_ok, notice, theme, req.user.id])
            }
            if(req.params.service == 2) {
            	var sql_Request = SqlString.format("UPDATE `pages` SET pagedata=json_set(pagedata, '$.mail_ok', ?, '$.api_cmd', ?, '$.auto_process', ?), `notice`=? WHERE service=2 and owner=?", [mail_ok, api_cmd, auto_process, notice, req.user.id])
            }
            if(req.params.service == 3) {
            	var sql_Request = SqlString.format("UPDATE `pages` SET pagedata=json_set(pagedata, '$.sv_ip', ?, '$.sv_port', ?), `notice`=? WHERE service=3 and owner=?", [sv_ip, sv_port, notice, req.user.id])
            }
            sql.query(sql_Request, (err) => {
              if(err) { console.log(err); return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }); }
              res.json({ success: true, title: "완료했습니다!",  message: "성공적으로 페이지 수정을 요청했습니다." });
            })
          }).catch(function (error) {
            res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 정의되지 않았습니다. 이 문제는 Baw Service의 문제일 가능성이 큽니다." });
          });
        }).catch(function (error) {
          res.json({ success: false, title: "필요 데이터 미전달됨",  message: "모든 입력칸을 채우세요." });
        });
    } else {
      res.json({ success: false, title: "권한이 없습니다.",  message: "로그인하지 않았거나, 서비스 접근 권한이 없습니다." });
    }
};
