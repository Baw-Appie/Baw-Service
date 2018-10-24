var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user) {
    var data = {
      "name": "나의 정보 수정"
    }
    var options = {
      "groups": {
        "general": {
          korean: "일반",
          description: "계정 일반 설정",
          text: [
            { name: "id", korean: "아이디", disabled: true },
            { name: "svname", korean: "서버 이름" },
            { name: "mail", korean: "메일", disabled: true },
            { name: "ninfo", korean: "계좌 정보" }
          ]
        },
        "password": {
          korean: "비밀번호",
          description: "비밀번호를 변경하려면 아래칸을 채우세요.",
          password: [
            { name: "oldpass", korean: "기존 비밀번호" },
            { name: "pass1", korean: "새 비밀번호" },
            { name: "pass2", korean: "새 비밀번호 확인" }
          ]
        }
      },
      "savetojson": ["svname", "ninfo"]
    }
    var help = `<p>후원 보너스 설정의 다음줄은 || 으로 구분합니다.</p>
    <p>후원 보너스 설정 예제: 캐시||칭호||Baw Service 최고</p>
    <p>API 플러그인의 사용을 원치 않는경우 API 플러그인 명령어칸을 빈칸으로 설정해주세요.</p>
    <p>API 플러그인 명령어 플레이스 홀더 [유저이름: &lt;player&gt;] [후원 금액: &lt;money&gt;] [후원 보상: &lt;package&gt;]</p>
    <p>API 플러그인 명령어는 콘솔에서 실행됩니다. '/'를 입력할 필요가 없습니다.</p>
    <p>API 플러그인 명령어 예제: say &lt;player&gt;님이 &lt;money&gt;원으로 &lt;package&gt;(을)를 구매했습니다!</p>
    <p><a href='https://`+ req.hostname +`/api/API/edit'>[API 설정]</a></p>
    <p>공지 사항란에 HTML을 사용할 수 있습니다.</p>`

    sql.query('select * from users where id=' + SqlString.escape(req.user.id), function(err, rows){
      var pagedata = JSON.parse(rows[0]['userdata'])
      res.render('manage/edit', { data: data, rows: rows, pagedata: pagedata, help: help, options: options })
    });
  } else {
    res.redirect('/auth/login')
  }
}
