const { io } = require('../../index');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');

/**
 * Sockets explanation
 *
 * 1. Listen
 * io.on -> listen all events
 * socket.on -> listen specific event
 *
 * 2. Emits
 * socket.emit -> emit specific event to the sender
 * io.emit -> emit specific event to all clients
 * socket.broadcast.emit -> emit specific event to all clients except the sender
 *
 * 3. Rooms
 * socket.join -> join to a room
 * socket.leave -> leave a room
 * io.to.emit -> emit specific event to all clients in a room
 * socket.broadcast.to.emit -> emit specific event to all clients in a room except the sender
 *
 */

io.on('connection', (socket) => {
  const userConnected = socket.handshake.query.uid;
  console.log('Client connected', userConnected);

  if (userConnected) {
    try {
      User.findById(userConnected).then((user) => {
        user.socketId = socket.id;
        user.status = 'Online';
        user.save();
      });
    } catch (error) {
      console.log(error);
    }
  }

  // TODO: Analize if this is necessary or could be done just with a request
  // one to one chat
  socket.on('start_chat', async (data) => {
    try {
      const { to, from } = data;

      // Validate if already exists a chat between users
      const chat = await Chat.findOne({
        participants: { $elemMatch: { user: to } },
        participants: { $elemMatch: { user: from } },
        group: false,
      }).populate('participants.user', '_id fullName avatar status');

      if (!chat) {
        let newChat = await Chat.create({
          participants: [{ user: to }, { user: from }],
          group: false,
        });

        newChat = await Chat.findById(newChat).populate(
          'participants.user',
          '_id fullName avatar status'
        );

        socket.emit('start_chat', newChat);
      } else {
        socket.emit('start_chat', chat);
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on('get_messages', async (data, callback) => {
    const { chat, page, size = 20 } = data;

    const messages = await Message.find({ chat })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .populate('from', '_id fullName avatar')
      .populate('to', '_id fullName avatar');

    callback(messages);
  });

  socket.on('send_message', async (data) => {
    const { chat, from, to, content, type } = data;

    const toUser = await User.findById(to);
    const fromUser = await User.findById(from);

    const newMessage = {
      chat,
      from,
      to,
      content,
      type,
    };
    await Message.create(newMessage);

    // Incoming message
    io.to(toUser?.socketId).emit('new_message', {
      chat,
      message: newMessage,
    });

    // Outgoing message
    io.to(fromUser?.socketId).emit('new_message', {
      chat,
      message: newMessage,
    });
  });

  // TODO: read_messages
  // TODO: delete_message

  socket.on('disconnect', () => {
    console.log('Client disconnected', userConnected);

    if (userConnected) {
      try {
        User.findById(userConnected).then((user) => {
          user.socketId = '';
          user.status = 'Offline';
          user.save();
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
});
