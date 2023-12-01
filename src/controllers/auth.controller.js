const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');
const { gmailTransport } = require('../services/mail/mail.service');
const verifyAccountTemplate = require('../services/mail/templates/verifyAccount.template');
const emailConfig = require('../config/mail.config');
const { generateJWT } = require('../utils/jwt.util');
const { upperCammelCase } = require('../utils/formatter.util');

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
      msg: 'Invalid email or password',
    });
  }

  // create token
  res.json({
    status: true,
    token: 'token',
    msg: 'Login successful',
  });
});

const sendVerificationEmail = catchAsync(async (req, res = response) => {
  const { uid } = req;
  const timeToExpire = '48h';

  const user = await User.findById(uid);
  const verifyToken = await generateJWT({ uid, firstName: user.firstName }, timeToExpire);
  const verifyLink = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/verify-account/${verifyToken}`;

  const mailOptions = {
    from: emailConfig.user,
    to: user.email,
    subject: 'Account Verification',
    html: verifyAccountTemplate(
      upperCammelCase(user.firstName),
      verifyLink,
      timeToExpire
    ),
  };

  gmailTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        msg: 'Error sending verification email',
      });
    } else {
      res.json({
        status: true,
        msg: 'Verification email sent successfully',
      });
    }
  });
});

module.exports = {
  register,
  login,
  sendVerificationEmail,
};
