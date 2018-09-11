var nodemailer = require('nodemailer');
var server_settings = require('../config/server_settings');
module.exports = (mailOptions) => {
  new Promise(function(resolve, reject) {
    nodemailer.createTransport({
       host: server_settings.mail_sv,
       auth: {
         user: server_settings.mail_id,
         pass: server_settings.mail_pw
       }
     }).sendMail(mailOptions, (error, info) => {
       transporter.close();
       if(error) {
         reject(error)
       }
     });
  });
}
