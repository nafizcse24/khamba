const express = require('express');
const router = express.Router();
const { payChanda, getTransactions } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chanda', protect, payChanda);
router.get('/transactions', protect, getTransactions);

module.exports = router;
