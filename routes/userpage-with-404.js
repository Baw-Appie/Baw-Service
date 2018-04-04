var sql = require('../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
var fs = require('fs');
module.exports = function(req, res, next) {
  var path = req.path.split('/')
  var sql_req = sql('select * from page where name=' + SqlString.escape(path[1]), function(err, rows){
    if(err) { throw err }
    if(rows.length === 0) {
      // 404 에러 처리
      res.status(404).render('error/404')
    } else {
      var servicename;
      if(rows[0]['service'] == '1') {
        var servicename = "donation";
      } else if(rows[0]['service'] == '2') {
        var servicename = "id_check";
      } else if(rows[0]['service'] == '3') {
        var servicename = "server_status"
      } else {
        res.render('error/500')
      }
      if(servicename){
        if(fs.existsSync('./views/user_page/'+servicename+'-'+rows[0]['theme']+'.jade')) {
          var sql_req2 = sql('select * from `id` where `id`='+SqlString.escape(rows[0]['owner']), function(err, rows2) {
            if(err){ throw err }
            var sql_req3 = sql('select * from `page` where `owner`='+SqlString.escape(rows[0]['owner']), function(err, rows3){
              if(err){ throw err }
              if(rows[0]['service'] == '1') {
                res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0]})
              } else if(rows[0]['service'] == '2') {
                res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0]})
              } else if(rows[0]['service'] == '3') {
                var mineping = require("mineping");
                if(rows[0]['sv_ip'] == '' || rows[0]['sv_port'] == '') {
                  res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false})
                } else {
                  const dns = require('dns');
                  dns.resolve('_minecraft._tcp.'+rows[0]['sv_ip'], 'SRV', (err, records) => {
                    if (err) {
                      var sv_ip = rows[0]['sv_ip']
                      var sv_port = rows[0]['sv_port']
                    } else {
                      var sv_ip = records[0]['name']
                      var sv_port = records[0]['port']
                    }
                    mineping(1, sv_ip, sv_port, function(err, data) {
                      if(err) {
                          res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false})
                      } else {
                        res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: data})
                      }
                    });
                  });
                }
              }
            })
          })
        } else {
          res.render('error/500')
        }
      } else {
        res.render('error/500')
      }
    }
  });
}
