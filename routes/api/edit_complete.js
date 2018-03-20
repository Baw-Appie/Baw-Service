var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function(req, res) {
    if(req.user.id) {
        if(req.params.service){
          if(req.params.service == "API") {
          	var sql_req = sql('UPDATE `id` SET `api_ok` = '+SqlString.escape(req.body.api_ok)+', `api_key`='+SqlString.escape(req.body.api_key)+', `api_ip`='+SqlString.escape(req.body.api_ip)+', `api_port`='+SqlString.escape(req.body.api_port)+', `api`='+SqlString.escape(req.body.api)+' WHERE `id`.`id` = '+ SqlString.escape(req.user.id))
          } else if (req.params.service == "SMS") {
            var sql_req = sql('UPDATE `sms` SET `phone` = '+SqlString.escape(req.body.phone)+' WHERE `sms`.`id` = '+ SqlString.escape(req.user.id))
          } else if (req.params.service == "Telegram") {
            var sql_req = sql('UPDATE `telegram` SET `chat_id` = '+SqlString.escape(req.body.chat_id)+' WHERE `telegram`.`id` =  '+ SqlString.escape(req.user.id))
          }
          req.session.error = '적용되었습니다!'
          res.redirect('/')
      } else {
        res.render('error/403')
      }
  };
}
