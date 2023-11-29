db = db.getSiblingDB('realtime_chat');

db.createUser({
  user: 'root',
  pwd: 'zUEA9rzHRwmB288SZrEN8uK6s2S7YdMNqh3k',
  roles: [
    {
      role: 'dbOwner',
      db: 'realtime_chat',
    },
  ],
});
