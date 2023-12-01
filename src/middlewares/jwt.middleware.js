const { response } = require('express');
const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');

/**
 * Validate JWT and save uid in req
 */
const jwtValidation = catchAsync(async (req, res = response, next) => {
  var token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Looks like you are not logged in! Please log in to get access.',
    });
  }

  const { uid, iat: jwtSignedTime } = jwt.verify(token, envConfig.jwtSecret);

  // check if user still exists
  const user = await User.findById(uid);
  if (!user) {
    return res.status(401).json({
      error: 'The user belonging to this token does no longer exist.',
    });
  }

  // check if user changed password after the token was issued
  if (user.changePasswordAfter(jwtSignedTime)) {
    return res.status(401).json({
      error: 'User recently changed password! Please log in again.',
    });
  }

  req.uid = uid;
  next();
});

module.exports = jwtValidation;
