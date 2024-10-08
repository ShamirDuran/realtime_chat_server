const { io } = require('../../index');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const { messages: messagesConf } = require('../config/api.config');
const { baseParticipantsData, messagesPopulate } = require('./populates.sockets');

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

  socket.on('get_direct_chats', async (data, callback) => {
    const { uid } = data;
    const filter = {
      group: false,
      'participants.user': uid,
      'events.type': { $nin: ['pinned', 'deleted'] },
    };

    const chats = await Chat.find(filter)
      .populate(baseParticipantsData)
      .populate(messagesPopulate);

    callback(chats);
  });

  socket.on('get_group_chats', async (data, callback) => {
    const { uid } = data;
    const filter = {
      group: true,
      'participants.user': uid,
      'events.type': { $nin: ['pinned', 'deleted'] },
    };

    const chats = await Chat.find(filter)
      .populate(baseParticipantsData)
      .populate(messagesPopulate);

    callback(chats);
  });

  socket.on('get_pinned_chats', async (data, callback) => {
    const { uid } = data;
    const filter = {
      group: false,
      'participants.user': uid,
      'events.type': { $in: ['pinned'] },
    };

    const chats = await Chat.find(filter)
      .populate(baseParticipantsData)
      .populate(messagesPopulate);

    callback(chats);
  });

  // TODO: Analize if this is necessary or could be done just with a request
  // one to one chat
  socket.on('start_chat', async (data) => {
    const { to, from } = data;

    // Validate if already exists a chat between users
    const chat = await Chat.findOne({
      participants: {
        $all: [{ $elemMatch: { user: to } }, { $elemMatch: { user: from } }],
      },
      group: false,
    })
      .populate('participants.user', '_id fullName avatar status')
      .populate({
        path: 'messages',
        options: {
          sort: { _id: -1 },
          limit: messagesConf.limit,
          populate: {
            path: 'from',
            select: '_id fullName avatar',
          },
        },
      });

    if (!chat) {
      let newChat = await Chat.create({
        participants: [{ user: to }, { user: from }],
        group: false,
      });

      await newChat.populate('participants.user', '_id fullName avatar status');
      await newChat.populate('messages');

      socket.emit('start_chat', newChat);
    } else {
      socket.emit('start_chat', chat);
    }
  });

  socket.on('get_messages', async (data, callback) => {
    const { chat, page, size = messagesConf.limit } = data;

    const messages = await Chat.findById(chat)
      .select('messages')
      .populate({
        path: 'messages',
        options: {
          skip: page * size,
          limit: size,
        },
      });

    callback(messages);
  });

  socket.on('send_message', async (data) => {
    const { chat, from, content, type } = data;

    const fromUser = await User.findById(from);
    const chatData = await Chat.findById(chat).populate(
      'participants.user',
      '_id socketId'
    );

    // Get participants except the sender
    const toUsers = chatData.participants
      .filter(({ user }) => user._id.toString() !== fromUser._id.toString())
      .map((participant) => participant.user);

    const newMessage = await Message.create({
      chat,
      from,
      content,
      type,
    });

    // add new message id to chat messages
    chatData.messages.push(newMessage);
    await chatData.save();
    await newMessage.populate('from', '_id fullName avatar');

    // Outgoing message
    io.to(fromUser?.socketId).emit('new_message', {
      chat,
      message: newMessage,
    });

    // send message to all participants
    toUsers.forEach((user) => {
      io.to(user.socketId).emit('new_message', {
        chat,
        message: newMessage,
      });
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
