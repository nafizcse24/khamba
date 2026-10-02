const express = require('express');
const router = express.Router();
const { rechargeBalance } = require('../controllers/rechargeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, rechargeBalance);

module.exports = router;
