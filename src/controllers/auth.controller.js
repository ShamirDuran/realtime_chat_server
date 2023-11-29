const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');
const moment = require('moment/moment');
const generatePassword = require('../utils/generatePassword');
const { gmailTransport } = require('../services/mail/mail.service');
const otpTemplate = require('../services/mail/templates/otp');
const configEnv = require('../config/env.config');

const register = catchAsync(async (req, res = response, next) => {
  const { firstName, lastName, email, password } = req.body;
  const userData = { firstName, lastName, email, password };

  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.verified) {
    // if user exists and verified then return error
    return res.status(400).json({
      status: false,
      msg: 'The email is already registered',
    });
  } else if (existingUser) {
    // if user exists but not verified then update the user
    await User.findOneAndUpdate({ email }, userData, {
      new: true,
      validateModifiedOnly: true,
    });

    req.uid = existingUser._id;
    next();
  } else {
    // if user does not exist then create new user
    const newUser = await User.create(userData);
    req.uid = newUser._id;

    next();
  }
});

const login = catchAsync(async (req, res = response, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password) {
    return res.status(400).json({
      status: false,
      msg: 'Invalid email or password',
    });
  }

  if (!user || !(await user.validatePassword(password, user.password))) {
    return res.status(400).json({
      status: false,
      msg: 'Incorrect password',
    });
  }

  // create token
  res.json({
    status: true,
    token: 'token',
    msg: 'Login successful',
  });
});

const sendOtp = catchAsync(async (req, res = response) => {
  const { uid } = req;

  const newOtp = generatePassword();
  const otpExpires = moment().add(configEnv.otpExpires, 'minutes');

  const user = await User.findByIdAndUpdate(uid, {
    otpExpiryTime: otpExpires,
  });

  user.otp = newOtp;
  await user.save({ new: true, validateModifiedOnly: true });

  const mailOptions = {
    from: 'testing@gmail.com',
    to: user.email,
    subject: 'Verification OTP',
    html: otpTemplate(user.firstName, newOtp, configEnv.otpExpires),
  };

  gmailTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        msg: 'Error sending OTP',
      });
    } else {
      res.json({
        status: true,
        msg: 'OTP sent successfully',
      });
    }
  });
});

module.exports = {
  register,
  login,
  sendOtp,
};
