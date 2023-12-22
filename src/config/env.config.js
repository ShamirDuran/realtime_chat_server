const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  prefix: process.env.PREFIX || 'api',
  environment: process.env.ENVIRONMENT || 'development',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  dbUsername: process.env.DB_USERNAME || 'root',
  dbPassword: process.env.DB_PASSWORD || 'secret',
  dbName: process.env.DB_NAME || 'realtime_chat',
  dbPort: process.env.DB_PORT || 27017,
  dbConnection: process.env.DB_CONNECTION, // mongo atlas connection string
  otpExpires: process.env.OTP_EXPIRES || 10,
};
