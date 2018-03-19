var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function(req, res) {
    if(req.user.id) {
        if(req.params.service){
          var service = req.params.service;
        	var notice = req.body.notice;
        } else {
        	var notice = "";
        }

        if(service == 1 || service  == 2){
        	if(req.body.mail_ok){
        		var mail_ok = req.body.mail_ok;
        	} else {
        		var mail_ok = 1;
        	}
        	if(req.body.api_cmd) {
        		var api_cmd = req.body.api_cmd;
        	} else {
        		var api_cmd = "";
        	}
        }
        if(service == 2){
        	if(req.body.auto_process){
        		var auto_process = req.body.auto_process;
        	} else {
        		var auto_process = 1;
        	}
        }

        if(service == 1){
        	if(req.body.youtube){
        		var youtube = req.body.youtube;
        	} else {
        		var youtube = "";
        	}
        	if(req.body.disabled){
        		var disable = req.body.disabled;
        	} else {
        		var disable = "";
        	}
        	if(req.body.theme){
        		var theme = req.body.theme;
        	} else {
        		var theme = "bootstrap3";
        	}
        	var disabled = "계좌이체";
        	if(req.body.bouns){
        		var bouns = req.body.bouns;
        	} else {
        		var bouns = "";
        	}
        	if(req.body.sms_ok){
        		var sms_ok = req.body.sms_ok;
        	} else {
        		var sms_ok = 0;
        	}
        	if(req.body.slack_ok){
        		var slack_ok = req.body.slack_ok;
        	} else {
        		var slack_ok = 0;
        	}
        	if(req.body.tg_ok){
        		var tg_ok = req.body.tg_ok;
        	} else {
        		var tg_ok = 0;
        	}
        	if(req.body.kakao_ok){
        		var kakao_ok = req.body.kakao_ok;
        	} else {
        		var kakao_ok = 0;
        	}
        }
        if(service == 3){
        	if(req.body.sv_ip){
        		var sv_ip = req.body.sv_ip;
        	} else {
        		var sv_ip = "";
        	}
        	if(req.body.sv_port){
        		var sv_port = req.body.sv_port;
        	} else {
        		var sv_port = "";
        	}
        }

        if(req.params.service == 1) {
          var sql_req = sql('UPDATE `page` SET `mail_ok` = ' + SqlString.escape(mail_ok) + ', `bouns` = ' + SqlString.escape(bouns) + ', `sms_ok` = ' + SqlString.escape(sms_ok) + ', `slack_ok` = ' + SqlString.escape(slack_ok) + ', `kakao_ok` = ' + SqlString.escape(kakao_ok) + ', `tg_ok` = ' + SqlString.escape(tg_ok) + ', `api_cmd` = ' + SqlString.escape(api_cmd) + ', `disabled`=' + SqlString.escape(disabled) + ', `notice` =  ' + SqlString.escape(notice) +', `theme`=' + SqlString.escape(theme) + ', `youtube`=' + SqlString.escape(youtube) + ' WHERE service=1 and owner=' + SqlString.escape(req.user.id))
        }

        if(req.params.service == 2) {
        	var sql_req = sql("UPDATE `page` SET `mail_ok` = " + SqlString.escape(mail_ok) + ", `api_cmd` = " + SqlString.escape(api_cmd) +", `notice`=" + SqlString.escape(notice) + ", `youtube`=" + SqlString.escape(youtube) + " , `auto_process`=" + SqlString.escape(auto_process) + " WHERE service=2 and owner=" + SqlString.escape(req.user.id))
        }
        if(req.params.service == 3) {
        	var sql_req = sql("UPDATE `page` SET `sv_ip` = " + SqlString.escape(sv_ip) + ", `sv_port` = " + SqlString.escape(sv_port) + ", `notice`=" + SqlString.escape(notice) + ", `youtube`=" + SqlString.escape(youtube) + " WHERE service=3 and owner=" + SqlString.escape(req.user.id))
        }
        req.session.error = '적용되었습니다!'
        res.redirect('/')
    } else {
      res.render('error/403')
    }
};
