const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/transactions/send
router.post('/send', protect, async (req, res) => {
  const { receiverId, amount, description } = req.body;
  
  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Process transaction
    sender.balance -= amount;
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/transactions
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
