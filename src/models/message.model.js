const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
    required: true,
  },
  from: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Text', 'Image', 'Video', 'Audio', 'File'],
    default: 'Text',
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      readAt: { type: Date },
    },
  ],
  forwared: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

messageSchema.methods.toJSON = function () {
  const { __v, _id, ...message } = this.toObject();
  message.uid = _id;
  return message;
};

module.exports = mongoose.model('Message', messageSchema);
