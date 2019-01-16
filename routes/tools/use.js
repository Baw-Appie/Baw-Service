module.exports = async (req, res) => {
  var {tool} = req.params
  if(tool.toLowerCase() == "votifier") {
    var data = {
      "name": "Votifier 테스트",
      "service": 99
    }
    var options = {
      "groups": {
        "general": {
          korean: "일반",
          description: "사이트 일반 설정",
          text: [
            { name: "ip", korean: "IP" },
            { name: "port", korean: "Votifier Port" },
            { name: "nick", korean: "닉네임" },
            { name: "service", korean: "Votifier 서비스 이름" }
          ],
          textarea: [{ name: "key", korean: "Votifier 공개키" }],
        }
      },
      "savetojson": []
    }
    res.render('manage/edit', { data: data, rows: [{ip: "", port: "8192", key: "", service: "minelistkr", nick: ""}], pagedata: [], options: options })
  } else if(tool.toLowerCase() == "status") {
    var data = {
      "name": "서버 상태 테스트",
      "service": 99
    }
    var options = {
      "groups": {
        "general": {
          korean: "일반",
          description: "사이트 일반 설정",
          text: [
            { name: "ip", korean: "IP" },
            { name: "port", korean: "Port", help: "SRV 도메인을 입력하면 무시됩니다." }
          ],
        }
      },
      "savetojson": []
    }
    res.render('manage/edit', { data: data, rows: [{ip: "", port: "25565"}], pagedata: [], options: options })
  }
}
