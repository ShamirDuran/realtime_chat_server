const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Text', 'Image', 'Video', 'Audio', 'File'],
    default: 'text',
  },
  readBy: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
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
