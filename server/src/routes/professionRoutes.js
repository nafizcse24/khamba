const express = require('express');
const router = express.Router();
const { getProfessions } = require('../controllers/paymentController');

router.get('/', getProfessions);

module.exports = router;
