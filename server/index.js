const connectDB = require('./src/config/db');
const app = require('./src/app');

// Connect to MongoDB
connectDB();

// Export the Express API for Vercel Serverless Functions
module.exports = app;
