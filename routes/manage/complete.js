var sql = require('../../config/dbtool');
var socket_api = require('../../libs/socket_api')
var SqlString = require('sqlstring');
var sqlp = require('../../libs/sql-promise');
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

module.exports = async (req, res) => {
  if(req.user) {
    try {
      var { id, service, status, noapi } = req.params
      if(service == "1" || service == "2"){
        var data = (await sqlp(sql, SqlString.format("SELECT * from service WHERE owner=? and num=?", [req.user.id, id])))
        if (data.length == 0) {
          return res.json({ success: false, title: "권한이 없습니다.", message: "해당 기록 수정 권한이 없습니다." })
        }
        data = data[0]
        var owner = (await sqlp(sql, SqlString.format("SELECT * FROM `users` WHERE id=?", [req.user.id])))[0]
        var page = (await sqlp(sql, SqlString.format("SELECT * FROM `pages` WHERE owner=?", [req.user.id])))[0]
        var api = (await sqlp(sql, SqlString.format("SELECT * FROM `api` WHERE id=?", [req.user.id])))


        if (!noapi && status == "1" && api.length != 0) {
          var api = api[0]
          if (api['api_enable'] == 1) {
            var api_cmd = JSON.parse(page['pagedata'])['api_cmd']
            switch(service) {
              case "1":
                var json = JSON.parse(data.extradata)
                api_cmd = api_cmd.replace("<player>", data['nick']).replace("<money>", json['bal']).replace("<package>", json['bouns']).replace("원", "").replace(",", "")
                if(api['api_type'] == "socket") {
                  socket_api(api['api_port'], api['api_ip'], api['api_key'] + ';' + owner['id'] + ';' + api_cmd)
                } else if(api['api_type'] == "HTTP") {
                  await sqlp(sql, SqlString.format('insert into api1 values (?, ?, ?, ?, ?, ?, ?)', [req.user.id, api['api_key'], data['page'], data['nick'], json['bal'], json['pin'], api_cmd]))
                }
                break;
              case "2":
                api_cmd = api_cmd.replace("<player>", data['nick']);
                if(api['api_type'] == "socket") {
                  socket_api(api['api_port'], api['api_ip'], api['api_key'] + ';' + owner['id'] + ';' + api_cmd)
                } else if(api['api_type'] == "HTTP") {
                  await sqlp(sql, SqlString.format('insert into api2 values (?, ?, ?, ?, ?)', [req.user.id, api['api_key'], data['page'], data['nick'], api_cmd]))
                }
                break;
              default:
                return res.json({ success: false, title: '실패했습니다.', message: "서비스 처리에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." })
            }
          }
        }

        try { await sqlp(sql, SqlString.format('UPDATE `service` SET status=? WHERE num=?', [req.params.status, req.params.id])) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
        return res.json({ success: true, title: "완료했습니다!", message: "ID "+id+" 의 처리 상태 변경이 완료되었습니다." });
      }
    } catch(e) {
      res.json({ success: false, title: '실패했습니다.', message: "서비스 처리에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." })
    }
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "로그인이 필요합니다." });
  }
}
