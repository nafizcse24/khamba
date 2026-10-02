const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log('MongoDB Connected');
};

module.exports = connectDB;
