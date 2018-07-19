var sql = require('../../config/dbtool');
var socket_api = require('../../libs/socket_api')
var SqlString = require('sqlstring');
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }
module.exports = function(req, res) {
  if(req.user) {
    if(isNumber(req.params.id) && isNumber(req.params.service) && isNumber(req.params.status))
      if(req.params.service == "1" || req.params.service == "2"){
        sql.query('select * from  `service'+req.params.service+'` WHERE owner='+SqlString.escape(req.user.id)+' and num=' + SqlString.escape(req.params.id), function(err, rows){
          if(err) { throw err };
          if(rows.length == 0) {
            res.json({ success: false, title: "권한이 없습니다.",  message: "해당 기록 수정 권한이 없습니다." });
          }
          sql.query('select * from `users` WHERE id='+SqlString.escape(req.user.id), function(err, rows2){


            if(err) { throw err };
            if(!req.query.noapi && req.params.status == "1"){
              sql.query(SqlString.format("SELECT * from `api` WHERE id=?", [req.user.id]), function(err, rows4){
                if(rows4.length != 0){
                  if(req.params.service == "1"){
                    if(rows4[0]['api_enable'] == 1) {
                      sql.query('select * from `pages` WHERE service=1 and owner='+SqlString.escape(req.user.id), function(err, rows3) {
                        if(err) { throw err };
                        var api_cmd = JSON.parse(rows3[0]['pagedata'])['api_cmd'];
                        api_cmd = api_cmd.replace("<player>", rows[0]['nick']);
                        api_cmd = api_cmd.replace("<money>", rows[0]['bal']);
                        api_cmd = api_cmd.replace("<package>", rows[0]['bouns']);
                        api_cmd = api_cmd.replace("원", "");
                        api_cmd = api_cmd.replace(",", "");
                        if(rows2[0]['api'] == "socket"){
                          socket_api(rows4[0]['api_port'], rows4[0]['api_ip'], rows4[0]['api_key']+';'+rows2[0]['id']+';'+api_cmd, function(data){});
                        }
                        if(rows2[0]['api'] == "HTTP") {
                          sql.query('insert into api1 values ("'+req.user.id+'", '+SqlString.escape(rows4[0]['api_key'])+', '+SqlString.escape(rows[0]['page'])+', '+SqlString.escape(rows[0]['nick'])+', '+SqlString.escape(rows[0]['bal'])+', '+SqlString.escape(rows[0]['pin'])+', '+SqlString.escape(api_cmd)+')')
                        }
                      })
                    }
                  } else if (req.params.service == "2"){
                    if(rows4[0]['api_enable'] == 1) {
                      sql.query('select * from `pages` WHERE service=2 and owner='+SqlString.escape(req.user.id), function(err, rows3) {
                        if(err) { throw err };
                        var api_cmd = JSON.parse(rows3[0]['pagedata'])['api_cmd'];
                        api_cmd = api_cmd.replace("<player>", rows[0]['nick']);
                        if(rows2[0]['api'] == "socket"){
                          socket_api(rows4[0]['api_port'], rows4[0]['api_ip'], rows4[0]['api_key']+';'+rows2[0]['id']+';'+api_cmd, function(data){});
                        }
                        if(rows2[0]['api'] == "HTTP") {
                          var sql_Request = SqlString.format('insert into api2 values (?, ?, ?, ?, ?)', [req.user.id, rows4[0]['api_key'], rows[0]['page'], rows[0]['nick'], api_cmd])
                          sql.query(sql_Request)
                        }
                      })
                    }
                  }
                }
              })
            }
            sql.query('UPDATE  `service'+req.params.service+'` SET status='+SqlString.escape(req.params.status)+' WHERE num=' + SqlString.escape(req.params.id), function(err, rows){
              if(err) { throw err };
              res.json({ success: true, title: "완료했습니다!",  message: req.params.id+"번의 상태 변경 요청이 정상적으로 처리되었습니다!" });
            });
          });
        });
      } else {
        res.json({ success: false, title: "권한이 없습니다.",  message: "해당 서비스 접근 권한이 없습니다." });
      }
    } else {
      res.json({ success: false, title: "권한이 없습니다.",  message: "로그인이 필요합니다." });
    }
}
