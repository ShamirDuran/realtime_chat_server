const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  users: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['member', 'admin', 'left'],
        default: 'active',
      },
    },
  ],
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  group: {
    type: Boolean,
    default: false,
  },
  groupInfo: {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  events: [
    {
      type: String,
      created: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

chatSchema.methods.toJSON = function () {
  const { __v, _id, ...chat } = this.toObject();
  chat.uid = _id;
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
