const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!db) {
      throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(db);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
