const mongoose = require('mongoose');
const { dbConnection: databaseHost } = require('../config/env.config');

const dbConnection = async () => {
  try {
    await mongoose.connect(databaseHost, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.debug('Database connected');
  } catch (error) {
    console.error('Error connecting to database', error);
    throw new Error('Error connecting to database');
  }
};

module.exports = {
  dbConnection,
};
