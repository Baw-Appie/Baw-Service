var sql = require('../config/dbtool')
var SqlString = require('sqlstring')
var sqlp = require('../libs/sql-promise')
var fs = require('fs')
var mineping = require("mineping")
var dns = require('dns')
var sharp = require('sharp')
var TextToSVG = require('text-to-svg')

module.exports = async (req, res, next) => {
  var path = req.path.split('/')
  var page = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE ?", [{name: path[1]}]))
  if(page.length == 0) { res.status(404).render('error/404') }
  var service = page[0]['service']
  if(service == '1') {
    var servicename = "donation";
  } else if(service == '2') {
    var servicename = "id_check";
  } else if(service == '3') {
    var servicename = "server_status"
  } else if(service == '4') {
    var servicename = "history"
  } else {
    return res.status(500).render('error/500')
  }
  if(fs.existsSync('./views/user_page/'+servicename+'-'+page[0]['theme']+'.pug') == false){ return res.status(500).render('error/500') }
  var user = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE ?", [{id: page[0]['owner']}]))
  var otherpage = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE ?", [{owner: page[0]['owner']}]))
  var auth = await sqlp(sql, SqlString.format("SELECT * FROM auth WHERE ?", [{page: path[1]}]))
  if(auth.length == 0) { auth = false }

  var jsonpagedata = JSON.parse(page[0]['pagedata'])
  var jsonuserdata = JSON.parse(user[0]['userdata'])

  if(service == '1' || service == '2') {
    res.render('./user_page/'+servicename+'-'+page[0]['theme'], {pagedata: page[0], otherpage: otherpage, userdata: user[0], authdata: auth, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
  } else if(service == '3') {
    var timer1 = new Date()
    if(jsonpagedata['sv_ip'] == '' || jsonpagedata['sv_port'] == '') {
      res.render('./user_page/'+servicename+'-'+page[0]['theme'], {pagedata: page[0], userdata: user[0], otherpage: otherpage, data: false, authdata: auth, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
    } else {
      dns.resolve('_minecraft._tcp.'+jsonpagedata['sv_ip'], 'SRV', (err, records) => {
        if (err) {
          var sv_ip = jsonpagedata['sv_ip']
          var sv_port = jsonpagedata['sv_port']
        } else {
          var sv_ip = records[0]['name']
          var sv_port = records[0]['port']
        }
        mineping(1, sv_ip, sv_port, async (err, data) => {
          var timer2 = new Date();
          var timer3 = timer2-timer1
          if(req.query.type != "img"){
            if(err) { var data = false }
            res.render('./user_page/'+servicename+'-'+page[0]['theme'], {pagedata: page[0], userdata: user[0], otherpage: otherpage, data: data, authdata: auth, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
          } else {
            var textToSVG = TextToSVG.loadSync('./public/font.ttf');
            var attributes = {fill: 'black', stroke: 'black'};
            var options = {x: 0, y: 0, fontSize: 23, anchor: 'top', attributes: {fill: 'white', stroke: 'white', 'stroke-width': '0.1'}}
            var svname = new Buffer.from(textToSVG.getSVG(jsonuserdata['svname']+'서버', options))
            var address = new Buffer.from(textToSVG.getSVG(jsonpagedata['sv_ip'], options))
            var options2 = {x: 0, y: 0, fontSize: 18, anchor: 'top', attributes: attributes};
            if(err){
              var online = new Buffer.from(textToSVG.getSVG('연결 불가', options2))
              var version = new Buffer.from(textToSVG.getSVG('연결 불가', options2))
              var banner = './public/banner_offline.png'
            } else {
              var online = new Buffer.from(textToSVG.getSVG(data.currentPlayers+'명', options2))
              var version = new Buffer.from(textToSVG.getSVG(data.version.replace("BungeeCord ", '').replace("Spigot ", ''), options2))
              var banner = './public/banner_online.png'
            }
            var timer = new Buffer.from(textToSVG.getSVG(timer3+'ms', options2))

            var banner1 = await sharp(banner).overlayWith(svname, { left: 116, top: 29 }).toBuffer()
            var banner2 = await sharp(banner1).overlayWith(address, { left: 405, top: 29 }).toBuffer()
            var banner3 = await sharp(banner2).overlayWith(version, { left: 83, top: 98 }).toBuffer()
            var banner4 = await sharp(banner3).overlayWith(online, { left: 263, top: 98 }).toBuffer()
            var banner5 = await sharp(banner4).overlayWith(timer, { left: 452, top: 98 }).toBuffer()

            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': banner5.length
            })
            res.end(banner5)
          }
        })
      })
    }
  } else if(service == '4') {
    res.render('./user_page/'+servicename+'-'+rows[0]['theme'], {pagedata: rows[0], otherpage: rows3, userdata: rows2[0], authdata: rows4, jsonpagedata: jsonpagedata, jsonuserdata: jsonuserdata})
  }
}
