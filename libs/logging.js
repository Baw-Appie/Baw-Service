var config = require('../config/allow_ips');
var server_settings = require('../config/server_settings');

function check() {
  config.every(function (item, index, array) {
	  return true;
  });
}


module.exports = function(req, res, next) {
  var time = new Date().toLocaleTimeString();
  if(req.user)
    console.log('['+time+'] [Access] '+req.user.id+'('+req.ip+'): '+req.path+' ('+req.method+')')
  else
    console.log('['+time+'] [Access] '+req.ip+': '+req.path+' ('+req.method+')')
  next();
};
