const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const professionRoutes = require('./routes/professionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://192.168.10.66:5173',
  'http://192.168.10.66:5174'
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'khambaPay API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recharge', rechargeRoutes);

module.exports = app;
