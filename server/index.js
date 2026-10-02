const connectDB = require('./src/config/db');
const app = require('./src/app');

// Vercel Serverless Entrypoint
// This AWAITS the DB connection before every request — no buffering timeouts possible.
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('DB Connection Failed:', error.message);
    res.status(500).json({
      message: 'Could not connect to database',
      error: error.message
    });
  }
};
