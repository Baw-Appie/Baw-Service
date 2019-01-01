var sql = require('../config/dbtool');
var SocketAPI = require('./SocketAPI')
var SqlString = require('sqlstring');
var sqlp = require('./sql-promise');

module.exports = async (user, id, service, status, noapi) => {
  try {
    if(service == "1" || service == "2"){
      var data = (await sqlp(sql, SqlString.format("SELECT * from service WHERE owner=? and num=?", [user, id])))
      if (data.length == 0) {
        return { success: false, title: "권한이 없습니다.", message: "해당 기록 수정 권한이 없습니다." }
      }
      data = data[0]
      var owner = (await sqlp(sql, SqlString.format("SELECT * FROM `users` WHERE id=?", [user])))[0]
      var page = (await sqlp(sql, SqlString.format("SELECT * FROM `pages` WHERE owner=?", [user])))[0]
      var api = (await sqlp(sql, SqlString.format("SELECT * FROM `api` WHERE id=?", [user])))

      if (!noapi && status == "1" && api.length != 0) {
        var api = api[0]
        if (api['api_enable'] == 1) {
          var api_cmd = JSON.parse(page['pagedata'])['api_cmd']
          if(service == "1") {
            var json = JSON.parse(data.extradata)
            api_cmd = api_cmd.replace("<player>", data['nick']).replace("<money>", json['bal']).replace("<package>", json['bouns']).replace("원", "").replace(",", "")
            if(api['api_type'] == "HTTP") {
              var sql_Request = SqlString.format('insert into api1 values (?, ?, ?, ?, ?, ?, ?)', [user, api['api_key'], data['page'], data['nick'], json['bal'], json['pin'], api_cmd])
            }
          } else if (service == "2") {
            api_cmd = api_cmd.replace("<player>", data['nick']);
            if(api['api_type'] == "HTTP") {
              var sql_Request = SqlString.format('insert into api2 values (?, ?, ?, ?, ?)', [user, api['api_key'], data['page'], data['nick'], api_cmd])
            }
          } else {
            return { success: false, title: '실패했습니다.', message: "서비스 처리에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }
          }

          if(api['api_type'] == "socket") {
            try {
              SocketAPI(api['api_port'], api['api_ip'], api['api_key'] + ';' + owner['id'] + ';' + api_cmd)
            } catch(e) {
              return { success: false, title: '실패했습니다.', message: "Socket API 요청에 실패했습니다. 작업이 완료되지 않았습니다. 기타 서비스 설정 -> API 플러그인 설정이 정확한지 확인하세요." }
            }
          } else if(api['api_type'] == "HTTP") {
            await sqlp(sql, sql_Request)
          }
        }
      }
      try { await sqlp(sql, SqlString.format('UPDATE `service` SET status=? WHERE num=?', [status, id])) } catch(e) { return { success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." } }
      return { success: true, title: "완료했습니다!", message: "ID "+id+" 의 처리 상태 변경이 완료되었습니다." }
    }
  } catch(e) {
    console.log(e)
    return { success: false, title: '실패했습니다.', message: "서비스 처리에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }
  }
}
