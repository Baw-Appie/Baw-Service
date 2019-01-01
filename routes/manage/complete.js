var dataWorker = require('../../libs/dataWorker')

module.exports = async (req, res) => {
  if(req.user) {
    var { id, service, status, noapi } = req.params
    try {
      res.json(await dataWorker(req.user.id, id, service, status, noapi))
    } catch(e) {
      console.log(e)
      return res.json({ success: false, title: "허걱..", message: "현재 기술적 문제가 있습니다. 고객 센터로 문의해주세요." })
    }
  } else {
    return res.json({ success: false, title: "권한이 없습니다.",  message: "로그인이 필요합니다." });
  }
}
