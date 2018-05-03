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
            res.send('죄송합니다.'+req.ip+'에 대한 Baw Service Beta 4 접근 권한이 없습니다.');
          }
        } else {
          next();
        }
    }
};
