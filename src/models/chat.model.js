const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Member', 'Admin', 'Left'],
        default: 'Member',
      },
    },
  ],
  messages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Message',
    },
  ],
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
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

chatSchema.methods.toJSON = function () {
  const { __v, _id, participants, messages, ...chat } = this.toObject();
  chat.uid = _id;

  chat.participants = participants.map((participant) => {
    const { __v, _id, ...user } = participant.user;
    user.uid = _id;
    return { user, status: participant.status };
  });

  chat.messages = messages.map((message) => {
    const { __v, _id, from, ...msg } = message;
    msg.uid = _id;
    msg.from = {
      uid: from._id,
      ...from,
    };

    delete msg.from._id;
    return msg;
  });

  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
