const { response } = require('express');
const catchAsync = require('../utils/catchAsync.util');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const { messages: messagesConf } = require('../config/api.config');

const searchByTerm = catchAsync(async (req, res = response) => {
  const { searchTerm } = req.params;
  const { uid } = req;

  // Search into users by fullName
  const usersWithRegex = await User.find({
    fullName: { $regex: searchTerm, $options: 'i' },
    _id: { $ne: uid },
  }).select('_id fullName avatar');

  // Search into chats that contains searchTerm in the content but also chat participants includes the user with the uid provided
  const chats = await Chat.find({ 'participants.user': uid }).select('_id');

  let chatIds = chats.map((chat) => chat._id);
  const messagesWithRegex = await Message.find({
    chat: { $in: chatIds },
    content: { $regex: searchTerm, $options: 'i' },
  }).select('_id chat');

  const messagesIds = messagesWithRegex.map((message) => message._id);
  chatIds = messagesWithRegex.map((message) => message.chat);

  const chatsWithRegex = await Chat.find({
    _id: { $in: chatIds },
  })
    .populate('participants.user', '_id fullName avatar status')
    .populate({
      path: 'messages',
      match: { _id: { $in: messagesIds } },
      options: {
        sort: { _id: -1 },
        limit: messagesConf.limit,
        populate: {
          path: 'from',
          select: '_id fullName avatar',
        },
      },
    });

  return res.json({
    status: true,
    users: usersWithRegex,
    chats: chatsWithRegex,
    msg: 'Search completed successfully',
  });
});

const togglePinned = catchAsync(async (req, res = response) => {
  const { chatId } = req.params;
  const { uid } = req;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({
      status: false,
      msg: 'Chat not found',
    });
  }

  const participant = chat.participants.find((p) => p.user.toString() === uid);
  if (!participant) {
    return res.status(404).json({
      status: false,
      msg: 'User not found in chat',
    });
  }

  const pinnedEventIndex = chat.events.findIndex(
    (event) => event.type === 'pinned' && event.user.toString() === uid
  );

  if (pinnedEventIndex > -1) {
    // Remove the pinned event from the chat events
    chat.events.splice(pinnedEventIndex, 1);
  } else {
    // Add the pinned event to the chat events
    chat.events.push({
      type: 'pinned',
      user: uid,
    });
  }

  await chat.save();

  return res.json({
    status: true,
    msg: 'Chat pinned status updated successfully',
  });
});

module.exports = {
  searchByTerm,
  togglePinned,
};
