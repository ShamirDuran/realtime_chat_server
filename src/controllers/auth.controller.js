const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');
const { gmailTransport } = require('../services/mail/mail.service');
const verifyAccountTemplate = require('../services/mail/templates/verifyAccount.template');
const emailConfig = require('../config/mail.config');
const { generateJWT, validateJWT } = require('../utils/jwt.util');
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
    await User.findOneAndUpdate({ email }, userData);

    req.uid = existingUser._id;
    next();
  } else {
    // if user does not exist then create new user
    const newUser = await User.create(userData);
    req.uid = newUser._id;

    next();
  }
});

const login = catchAsync(async (req, res = response) => {
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

  if (!user.verified) {
    return res.status(400).json({
      status: false,
      msg: 'Account not verified',
    });
  }

  const token = await generateJWT({ uid: user._id }, '24h');

  // create token
  res.json({
    status: true,
    token,
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
  )}/auth/verify-account/${verifyToken}`;

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
      console.log('verifyToken', verifyToken);
      res.json({
        status: true,
        msg: 'Verification email sent successfully',
      });
    }
  });
});

const verify = catchAsync(async (req, res = response) => {
  const { token } = req.params;
  const [isValid, decoded] = validateJWT(token);

  if (!isValid) {
    return res.status(400).json({
      status: false,
      msg: 'Link is invalid or has expired',
    });
  }

  const { uid } = decoded;

  const user = await User.findById(uid);
  if (!user) {
    return res.status(400).json({
      status: false,
      msg: 'User not found',
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: false,
      msg: 'User already verified',
    });
  }

  user.verified = true;
  await user.save();

  res.json({
    status: true,
    msg: 'Account verified successfully',
  });
});

module.exports = {
  register,
  login,
  sendVerificationEmail,
  verify,
};
