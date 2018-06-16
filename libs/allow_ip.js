var config = require('../config/allow_ips');
var server_settings = require('../config/server_settings');

function check() {
  config.every(function (item, index, array) {
	  return true;
  });
}


module.exports = function() {
    return function allow_ip( req, res, next ) {
        var allow;
        if(server_settings.whitelist == true) {
          if( config.indexOf(req.ip) >= 0 ) {
              next();
          } else {
            res.status('403').send('HTTP 403: 현재 Baw Service Beta 4에 '+req.ip+'으로 접근할 수 없습니다. 관리자에게 문의하세요.');
          }
        } else {
          next();
        }
    }
};
