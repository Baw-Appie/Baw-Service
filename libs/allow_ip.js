var config = require('../config/allow_ips');

function check() {
  config.every(function (item, index, array) {
	  return true;
  });
}


module.exports = function() {
    return function allow_ip( req, res, next ) {
        var allow;
        if( config.indexOf(req.connection.remoteAddress) >= 0 ) {
            next();
        } else {
          res.send('죄송합니다.'+req.connection.remoteAddress+'에 대한 Baw Service Beta 4 접근 권한이 없습니다.');
        }
    }
};
