var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');
var sqlp = require('../../libs/sql-promise');

module.exports = async (req, res) => {
  var { service } = req.params
  if(req.user && service) {
    switch (service) {
      case "API":
        var { api_enable = 0, api_key = "", api_type = "HTTP", api_ip, api_port="3203" } = req.body
        if (!vali.isPort(api_port)) {
          return res.json({ success: false, title: "잘못된 데이터 감지됨", message: "API PORT가 잘못 입력되었습니다." });
        }
        var sql_Request = SqlString.format("UPDATE `api` SET `? WHERE `id=?", {api_enable: api_enable, api_key: api_key, api_type: api_type, api_ip: api_ip, api_port: api_port}, req.user.id)
        break;
      case "SMS": 
        var { phone } = req.body
        if (phone.length > 13 && phone.length < 12) {
          return res.json({ success: false, title: "잘못된 데이터 감지됨", message: "전화번호가 잘못 입력되었습니다." });
        }
        var sql_Request = SqlString.format("UPDATE `sms` SET `phone`=? WHERE `id=?", [phone, req.user.id])
        break;
      case "Telegram":
        var { chat_id } = req.body
        if (req.body.chat_id.length > 45) {
          res.json({ success: false, title: "잘못된 데이터 감지됨", message: "채팅방 ID를 제대로 입력하세요." });
        }
        var sql_Request = SqlString.format('UPDATE `telegram` SET `chat_id` = ? WHERE `id` = ?', [chat_id, req.user.id])
        break;
      case "Custom":
        var { domain } = req.body
        if ((await sqlp(sql, SqlString.format('SELECT * FROM custom_domain WHERE `domain`=?', [domain]))).length != 0) {
          return res.json({ success: false, title: "설정할 수 없습니다.", message: "이미 동일한 도메인이 등록되어 있습니다." });
        }
        var sql_Request = SqlString.format('UPDATE `custom_domain` SET `domain` = ? WHERE `custom_domain`.`owner` = ?', [domain, req.user.id])
        break;
      default:
        return res.json({ success: false, title: "설정할 수 없습니다.", message: "이미 동일한 도메인이 등록되어 있습니다." });
    }
    try { await sqlp(sql, sql_Request) } catch { return res.json({ success: false, title: '실패했습니다.', message: "요청에 실패했습니다. 좌측 메뉴의 버그 신고로 이 문제를 신고하세요." }) }
    return res.json({ success: true, title: "완료했습니다!", message: "성공적으로 페이지 수정을 요청했습니다." })
  }
}
