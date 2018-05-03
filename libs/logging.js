var config = require('../config/allow_ips');
var server_settings = require('../config/server_settings');

function check() {
  config.every(function (item, index, array) {
	  return true;
  });
}


module.exports = function(req, res, next) {
  if(req.user)
    console.log('[Access] '+req.user.id+'('+req.ip+'): '+req.path+' ('+req.method+')')
  else
    console.log('[Access] '+req.ip+': '+req.path+' ('+req.method+')')
  next();
};
