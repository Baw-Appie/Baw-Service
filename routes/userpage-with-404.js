var sql = require('../config/dbtool');
var SqlString = require('sqlstring');
var validator = require('validator');
var fs = require('fs');
module.exports = function(req, res, next) {
  var path = req.path.split('/')
  sql.query('select * from pages where name=' + SqlString.escape(path[1]), function(err, rows){
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
      } else if(rows[0]['service'] == '4') {
        var servicename = "history"
      }
      if(servicename){
        if(fs.existsSync('./views/user_page/'+servicename+'-'+rows[0]['theme']+'.pug')) {
          sql.query('select * from `users` where `id`='+SqlString.escape(rows[0]['owner']), function(err, rows2) {
            if(err){ throw err }
            sql.query('select * from `pages` where `owner`='+SqlString.escape(rows[0]['owner']), function(err, rows3){
              if(err){ throw err }
              sql.query('select * from `auth` where `page`=' + SqlString.escape(path[1]), function(err, rows4){
                if(rows4.length == 0){
                  var rows4 = false
                }
                var jsonpagedata = JSON.parse(rows[0]['pagedata'])
                var jsonuserdata = JSON.parse(rows2[0]['userdata'])
                if(rows[0]['service'] == '1') {
                  res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0], authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                } else if(rows[0]['service'] == '2') {
                  res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0], authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                } else if(rows[0]['service'] == '3') {
                  // 서버 상태 위젯 -- 가독성 주의

                  var mineping = require("mineping");
                  if(jsonpagedata['sv_ip'] == '' || jsonpagedata['sv_port'] == '') {
                    // 정보 없음 오류 렌더
                    res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false, authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                  } else {
                    // SRV 조회
                    const dns = require('dns');
                    dns.resolve('_minecraft._tcp.'+jsonpagedata['sv_ip'], 'SRV', (err, records) => {
                      if (err) {
                        // SRV 미사용
                        var sv_ip = jsonpagedata['sv_ip']
                        var sv_port = jsonpagedata['sv_port']
                      } else {
                        // SRV 사용
                        var sv_ip = records[0]['name']
                        var sv_port = records[0]['port']
                      }
                      // 서버 정보 가져옴
                      mineping(1, sv_ip, sv_port, function(err, data) {
                        if(err) {
                          // 정보 없음
                          res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: false, authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                        } else {
                          // 완료!
                          if(req.query.type != "img"){
                            res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], userdata: rows2[0], otherpage: rows3, data: data, authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                          } else {
                            // 이미지 모드로 진입!
                            const sharp = require('sharp');
                            const TextToSVG = require('text-to-svg');
                            const textToSVG = TextToSVG.loadSync('./public/font.ttf');
                            const attributes = {fill: 'black', stroke: 'black'};
                            const options = {x: 0, y: 0, fontSize: 35, anchor: 'top', attributes: attributes};
                            const svname = new Buffer.from(textToSVG.getSVG(jsonuserdata['svname']+'서버', options))
                            const options2 = {x: 0, y: 0, fontSize: 18, anchor: 'top', attributes: attributes};
                            const online = new Buffer.from(textToSVG.getSVG(data.currentPlayers+'명', options2))
                            const address = new Buffer.from(textToSVG.getSVG(jsonpagedata['sv_ip'], options2))
                            const version = new Buffer.from(textToSVG.getSVG(data.version, options2))
                            sharp('./public/banner.png')
                              .overlayWith(svname, { left: 2, top: 2 })
                              .toBuffer()
                              .then(function(buffer){
                                sharp(buffer)
                                .overlayWith(online, { left: 29, top: 70 })
                                .toBuffer()
                                .then(function(buffer){
                                  sharp(buffer)
                                  .overlayWith(address, { left: 140, top: 70 })
                                  .toBuffer()
                                  .then(function(buffer){
                                    sharp(buffer)
                                    .overlayWith(version, { left: 300, top: 70 })
                                    .toBuffer()
                                    .then(function(buffer){
                                      res.writeHead(200, {
                                       'Content-Type': 'image/png',
                                       'Content-Length': buffer.length
                                     });
                                     res.end(buffer);
                                    })
                                  })
                                })
                              })

                          }
                        }
                      });
                    });
                  }


                } else if(rows[0]['service'] == '4') {
                  res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0], authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
                }
              })
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
