var nodemailer = require('nodemailer');
var transporter = require('./libs/mail_init');
var mailOptions = {
from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
to: "pp121324@gmail.com",
subject: '[Baw Service] 가입 확인 이메일입니다.',
text: '이메일 내용'
};
transporter.sendMail(mailOptions, function(error, info) {
if (error) {
  console.log(error);
} else {
  console.log('Email sent! : ' + info.response);
}
transporter.close();
});