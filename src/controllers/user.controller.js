const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');

const getById = catchAsync(async (req, res = response) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    '_id fullName about avatar email lastSeen status'
  );

  if (!user) {
    return res.status(404).json({
      status: false,
      msg: 'User not found',
    });
  }

  res.json({
    status: true,
    user,
    msg: 'User fetched successfully',
  });
});

const getAll = catchAsync(async (req, res = response) => {
  const { uid } = req;
  const { name, onlyEnabled, page = 1, limit = 10 } = req.query;

  const users = await User.find({
    _id: { $ne: uid },
    verified: true,
    deleted: onlyEnabled === false ? false : { $in: [true, false] },
    ...(name && {
      fullName: { $regex: name, $options: 'i' },
    }),
  })
    .select('_id fullName avatar')
    .limit(limit * 1)
    .skip((page - 1) * limit);

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
