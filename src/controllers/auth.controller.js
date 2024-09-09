const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');
const { gmailTransport } = require('../services/mail/mail.service');
const verifyAccountTemplate = require('../services/mail/templates/verifyAccount.template');
const emailConfig = require('../config/mail.config');
const { generateJWT, validateJWT } = require('../utils/jwt.util');
const { upperCammelCase } = require('../utils/formatter.util');
const envConfig = require('../config/env.config');
const passwordResetTemplate = require('../services/mail/templates/passwordResetTemplate');

const register = catchAsync(async (req, res = response, next) => {
  const { fullName, email, password } = req.body;
  const userData = { fullName, email, password };

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
  const verifyToken = await generateJWT({ uid }, timeToExpire);
  const verifyLink = `${envConfig.webUrl}/auth/verify-account/${verifyToken}`;
  const firstName = user.fullName.split(' ')[0];

  const mailOptions = {
    from: emailConfig.user,
    to: user.email,
    subject: 'Account Verification',
    html: verifyAccountTemplate(upperCammelCase(firstName), verifyLink, timeToExpire),
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

/// Verify token
const verify = catchAsync(async (req, res = response) => {
  const { token } = req.params;

  const [isValid, decoded] = validateJWT(token);

  if (!isValid) {
    return res.status(400).json({
      status: false,
      msg: 'Link has expired. Please register again.',
    });
  }

  const { uid } = decoded;

  const user = await User.findById(uid);
  if (!user) {
    return res.status(400).json({
      status: false,
      msg: 'User does not exist. Please register.',
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: false,
      msg: 'Your account has already been verified. Please login.',
    });
  }

  user.verified = true;
  await user.save();

  const firstName = user.fullName.split(' ')[0];

  res.json({
    status: true,
    msg: `${upperCammelCase(
      firstName
    )}, your account has been verified successfully. Please login.`,
  });
});

/// Requested password reset link
const forgotPassword = catchAsync(async (req, res = response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(200).json({ status: true });

  const timeToExpire = '1h';
  const resetToken = await generateJWT({ uid: user._id }, timeToExpire);
  const resetLink = `${envConfig.webUrl}/auth/password_reset/${resetToken}`;
  const firstName = user.fullName.split(' ')[0];

  const mailOptions = {
    from: emailConfig.user,
    to: user.email,
    subject: 'Password Reset',
    html: passwordResetTemplate(upperCammelCase(firstName), resetLink, timeToExpire),
  };

  gmailTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        msg: 'Error sending password reset email',
      });
    } else {
      res.json({ status: true });
    }
  });
});

/// Requested password reset
const passwordReset = catchAsync(async (req, res = response) => {
  const token = req.headers.authorization;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({
      status: false,
      msg: 'Could not reset password. Please request a new link.',
    });
  }

  const [isValid, decoded] = validateJWT(token);

  if (!isValid) {
    return res.status(400).json({
      status: false,
      msg: 'Link has expired. Please request a new link.',
    });
  }

  const { uid } = decoded;

  const user = await User.findById(uid);
  if (!user) {
    return res.status(400).json({
      status: false,
      msg: 'User does not exist. Please register.',
    });
  }

  user.password = password;
  await user.save();

  return res.json({
    status: true,
    msg: 'Password reset successful. Please login.',
  });
});

module.exports = {
  register,
  login,
  sendVerificationEmail,
  verify,
  forgotPassword,
  passwordReset,
};
