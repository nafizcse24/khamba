const connectDB = require('./src/config/db');
const app = require('./src/app');

// Vercel serverless function entrypoint wrapper
module.exports = async (req, res) => {
  try {
    // Ensure the database is fully connected BEFORE passing the request to Express
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('CRITICAL: Serverless MongoDB Connection Failed', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      message: 'Server Error: Could not connect to Database', 
      error: error.message 
    }));
  }
};
