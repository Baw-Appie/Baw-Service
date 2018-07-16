var sql = require('./config/dbtool');
var server_settings = require('./config/server_settings');
var session_config = require('./config/session');
var SqlString = require('sqlstring');
var request = require('request');


// ID DB Update
sql.query("select * from id", function(err, rows){
  rows.forEach(function(item){
    console.log(item.id + " 계정을 이동하고 있습니다.")
    sql.query(SqlString.format("INSERT INTO users SET id=?, mail=?, password=?, status=?, userdata=json_object('svname', ?, 'regdate', ?, 'ninfo', ?, 'enc_mail', ?)", [item.id, item.mail, item.password, item.status, item.svname, item.regdate, item.ninfo, item.enc_mail]))
    if(item.api_key !== ""){
      sql.query(SqlString.format("INSERT INTO api SET id=?, api_enable=?, api_key=?, api_ip=?, api_port=?, api_type=?", [item.id, item.api_ok, item.api_key, item.api_ip, item.api_port, item.api]))
    }
  })
})

// PAGE DB UPDATE
sql.query("select * from page", function(err, rows){
  rows.forEach(function(item){
    console.log(item.name + " 페이지를 이동하고 있습니다.")
    if(item.service == 1){
      sql.query(SqlString.format("INSERT INTO pages SET name=?, owner=?, service=?, status=1, notice=?, theme=?, pagedata=json_object('regdate', ?, 'sms_ok', ?, 'mail_ok', ?, 'tg_ok', ?, 'kakao_ok', ?, 'bouns', ?, 'api_cmd', ?, 'disabled', ?, 'youtube', ?)", [item.name, item.owner, item.service, item.notice, item.theme, item.regdate, item.sms_ok, item.mail_ok, item.tg_ok, item.kakao_ok, item.bouns, item.api_cmd, item.disabled, item.youtube]))
    }
    if(item.service == 2){
      sql.query(SqlString.format("INSERT INTO pages SET name=?, owner=?, service=?, status=1, notice=?, theme=?, pagedata=json_object('regdate', ?, 'mail_ok', ?, 'api_cmd', ?, 'auto_process', ?)", [item.name, item.owner, item.service, item.notice, item.theme, item.regdate, item.mail_ok, item.api_cmd, item.auto_process]))
    }
    if(item.service == 3){
      sql.query(SqlString.format("INSERT INTO pages SET name=?, owner=?, service=?, status=1, notice=?, theme=?, pagedata=json_object('regdate', ?, 'sv_ip', ?, 'sv_port', ?)", [item.name, item.owner, item.service, item.notice, item.theme, item.regdate, item.sv_ip, item.sv_port]))
    }
    if(item.service == 4){
      sql.query(SqlString.format("INSERT INTO pages SET name=?, owner=?, service=?, status=1, notice=?, theme=?, pagedata=json_object('regdate', ?)", [item.regdate, item.name, item.owner, item.service, item.notice, item.theme, item.regdate]))
    }
  })
})
