var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var sendactionmail = require('../../libs/sendactionmail');
var SqlString = require('sqlstring');

module.exports = async (req, res) => {
  if(req.user) {
    try {
      var data = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE owner=?", [req.user.id]))
      if (data.length == 0) { throw('페이지가 존재하지 않습니다.') }
      if(req.query.page == 'true'){
        var data = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE service=? AND owner=?", [req.params.service, req.user.id]))
        if (data.length != 0) { throw('아직 페이지를 삭제할 수 없습니다..') }
        sendactionmail(req.user.id, req.user.mail, "delete_page_"+req.params.service, "페이지 삭제")
      } else {
        sendactionmail(req.user.id, req.user.mail, "delete_"+req.params.service, "데이터 삭제")
      }
      var msg = "확인 메일을 전송했습니다. Baw Service 등록시 사용하신 이메일을 확인해주세요."
    } catch(err) {
      if(err instanceof Error) {
        console.log(err)
        var msg = "메일 발송 시스템에 오류가 있습니다. 관리자에게 이 내용과 함께 오류를 알려주세요. \\n("+err+")"
      } else {
        var msg = "메일 발송에 실패했습니다! ("+err+")"
      }
    } finally {
      res.send('<script>alert("' + msg +'");history.go(-1);</script>')
    }
  }
}
