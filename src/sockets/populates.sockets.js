const { messages: messagesConf } = require('../config/api.config');

const baseParticipantsData = {
  path: 'participants.user',
  select: '_id fullName avatar status',
};

const messagesPopulate = {
  path: 'messages',
  options: {
    sort: { _id: -1 },
    limit: messagesConf.limit,
    populate: {
      path: 'from',
      select: '_id fullName avatar',
    },
  },
};

module.exports = {
  baseParticipantsData,
  messagesPopulate,
};
