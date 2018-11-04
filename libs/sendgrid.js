var server_settings = require('../config/server_settings');
var sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(server_settings.sendgrid_key);
module.exports = sendgrid
