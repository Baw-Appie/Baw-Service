var nodemailer = require('nodemailer');
var server_settings = require('../config/server_settings');
module.exports = nodemailer.createTransport({
    host: server_settings.mail_sv,
    auth: {
      user: server_settings.mail_id,
      pass: server_settings.mail_pw
    }
  });
