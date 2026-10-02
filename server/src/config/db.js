const mongoose = require('mongoose');

let cached = null;

const connectDB = async () => {
  if (cached) {
    return cached;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if IP is blocked or URI is wrong
    });
    cached = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
