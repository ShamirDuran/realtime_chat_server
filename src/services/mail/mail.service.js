const nodemailer = require('nodemailer');
const mailConfig = require('../../config/mail.config');

const gmailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: mailConfig.user,
    pass: mailConfig.password,
    clientId: mailConfig.clientId,
    clientSecret: mailConfig.clientSecret,
    refreshToken: mailConfig.refreshToken,
  },
});

module.exports = {
  gmailTransport,
};
