var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }
module.exports = function(req, res) {
  if(req.user.id) {
    if(isNumber(req.params.id) && isNumber(req.params.service) && isNumber(req.params.status))
      if(req.params.service == "1" || req.params.service == "2"){
        var sql_req = sql('select * from  `service'+req.params.service+'` WHERE owner='+SqlString.escape(req.user.id)+' and num=' + SqlString.escape(req.params.id), function(err, rows){
          if(err) { throw err };
          if(rows.length == 0) {
            res.render('error/403')
          }
          var sql_req2 = sql('select * from `id` WHERE id='+SqlString.escape(req.user.id), function(err, rows2){
            if(err) { throw err };
            if(!req.query.noapi && req.params.status == "1"){
              if(rows2[0]['api_ok'] == 1) {
                var sql_req3 = sql('select * from `page` WHERE owner='+SqlString.escape(req.user.id), function(err, rows3) {
                  if(err) { throw err };
                  var api_cmd = rows3[0]['api_cmd'];
                  api_cmd.replace("<player>", rows3[0]['nick']);
                  api_cmd.replace("<money>", rows3[0]['bal']);
                  api_cmd.replace("<package>", rows3[0]['bouns']);
                  api_cmd.replace("원", "");
                  api_cmd.replace(",", "");
                  if(rows2[0]['api'] == "socket"){
                    socket_api(rows2[0]['api_port'], rows2[0]['api_ip'], rows2[0]['api_key']+';'+rows2[0]['id']+';'+api_cmd, function(data){});
                  }
                  if(rows2[0]['api'] == "HTTP") {
                    var sql_req4 = sql('insert into api1 values ("'+req.user.id+'", '+SqlString.escape(rows2[0]['api_key'])+', '+SqlString.escape(rows[0]['page'])+', '+SqlString.escape(rows[0]['nick'])+', '+SqlString.escape(rows[0]['bal'])+', '+SqlString.escape(rows[0]['pin'])+', '+SqlString.escape(api_cmd)+')')
                  }
                })
              }
            }

            var sql_req5 = sql('UPDATE  `service'+req.params.service+'` SET status='+SqlString.escape(req.params.status)+' WHERE num=' + SqlString.escape(req.params.id), function(err, rows){
              if(err) { throw err };
              req.session.error = "적용되었습니다.";
              res.redirect('/')
            });
          });
        });
      } else {
        res.render('error/403')
      }
    } else {
      res.render('error/403')
    }
}
