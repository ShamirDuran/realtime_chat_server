const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  clientId: process.env.MAIL_CLIENT_ID,
  clientSecret: process.env.MAIL_CLIENT_SECRET,
  refreshToken: process.env.MAIL_REFRESH_TOKEN,
};
