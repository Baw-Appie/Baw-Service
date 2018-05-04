var config = require('../config/server_settings');
module.exports = function() {
    return function hostname( req, res, next ) {
        if (req.protocol == "http") {
          if (config.http_port != 80 && config.port_autobind == true) {
            req.hostname = req.hostname+':'+config.http_port;
            res.locals.hostname = req.hostname+':'+config.http_port;
          } else {
            req.hostname = req.hostname;
            res.locals.hostname = req.hostname;
          }
        } else {
          if (config.https_port !== 443 && config.port_autobind == true) {
            req.hostname = req.hostname+':'+config.https_port;
            res.locals.hostname = req.hostname+':'+config.https_port;
          } else {
            req.hostname = req.hostname;
            res.locals.hostname = req.hostname;
          }
        }
        next();
    };
};
