const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');

const getById = catchAsync(async (req, res = response) => {
  const { id } = req.params;

  // select all fiedl except deleted
  const user = await User.findById(id).select('-deleted -verified -password');

  res.json({
    status: true,
    user,
    msg: 'User fetched successfully',
  });
});

const getAll = catchAsync(async (req, res = response) => {
  const { uid } = req;
  const { onlyEnabled } = req.query;

  const users = await User.find({
    _id: { $ne: uid },
    verified: true,
    deleted: onlyEnabled === false ? false : { $in: [true, false] },
  }).select('firstName lastName _id');

  res.json({
    status: true,
    users,
    msg: 'Users fetched successfully',
  });
});

module.exports = {
  getById,
  getAll,
};
