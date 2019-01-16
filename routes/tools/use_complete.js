var votifier = require('votifier-send');
var mineping = require("mineping")
var dns = require('dns')

function vp(settings) {
  return new Promise((resolve, reject) => {
    try {
      votifier.send(settings, (err) => {
        if(err) return reject(err)
        return resolve()
      })
    } catch(e) { return reject(e) }
  });
}

module.exports = async (req, res) => {
  var {tool} = req.params
  if(tool.toLowerCase() == "votifier") {
    var {key="", ip="", port="8192", nick="Baw_Appie", service="minelistkr"} = req.body
    if(key == "" || ip == "") {
      return res.json({ success: false, title: "실패했습니다.", message: "모든값을 입력하세요." })
    }
    var settings = {
      key: key.replace(/ /g, '+'),
      host: ip,
      port: port,
      data: {
        user: nick,
        site: service,
        // addr: req.ip,
        // timestamp: new Date().getTime()
      }
    }
    try {
      var data = await vp(settings)
    } catch(e) {
      return res.json({ success: false, title: "실패했습니다.", message: e.message })
    }
    return res.json({ success: true, title: "성공했습니다.", message: "요청에 성공했습니다." })
  } else if(tool.toLowerCase() == "status") {
    var {ip="", port=""} = req.body
    if(port == "" || ip == "") {
      return res.json({ success: false, title: "실패했습니다.", message: "모든값을 입력하세요." })
    }

    dns.resolve('_minecraft._tcp.'+ip, 'SRV', (err, records) => {
      if (err) {
        var sv_ip = ip
        var sv_port = port
      } else {
        var sv_ip = records[0]['name']
        var sv_port = records[0]['port']
      }
      mineping(1, sv_ip, sv_port, async (err, data) => {
        if(err) { return res.json({ success: false, title: "실패했습니다", message: err.message }) }
        return res.json({ success: true, title: "성공했습니다.", message: data.motd+" ("+data.currentPlayers+"/"+data.maxPlayers+")"})
      })
    })

  }
}
