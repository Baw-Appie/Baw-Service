var config = require('../config/server_settings');
module.exports = (req, res, next) => {
  if(req.protocol == "http") {
    if(config.http_port != 80 && config.port_autobind == true)
    res.locals.hostname = req.hostname+':'+config.http_port
    else res.locals.hostname = req.hostname
  } else {
    if (config.https_port !== 443 && config.port_autobind == true)
    res.locals.hostname = req.hostname+':'+config.https_port
    else res.locals.hostname = req.hostname
  }
  next()
}
