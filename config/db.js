const mongoose = require('mongoose');
require('dotenv').config();

let connectionPromise;

mongoose.connection.on('disconnected', () => {
  connectionPromise = null;
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const db = process.env.MONGO_URI;
  if (!db) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(db)
      .then(() => {
        console.log('MongoDB Connected...');
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

module.exports = connectDB;
