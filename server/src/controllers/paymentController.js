const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const professions = require('../config/professions');

const getProfessions = (req, res) => {
  const professionList = Object.keys(professions).map((key) => ({
    name: key,
    amount: professions[key] / 4,
  }));
  res.json(professionList);
};

const payChanda = async (req, res) => {
  try {
    const userId = req.user._id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const baseAmount = professions[currentUser.profession];
    if (!baseAmount) {
      return res.status(400).json({ message: 'Invalid profession assigned to user' });
    }
    const amount = baseAmount / 4;

    // Prevent duplicate payment within rolling 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTx = await Transaction.findOne({
      userId,
      type: 'CHANDA_PAYMENT',
      status: 'SUCCESS',
      createdAt: { $gte: oneWeekAgo }
    });

    if (recentTx) {
      return res.status(400).json({ message: 'You have already paid your chanda for this week. Please wait until next week.' });
    }

    // Check balance
    if (currentUser.balance < amount) {
      await Transaction.create({
        userId,
        type: 'CHANDA_PAYMENT',
        amount,
        status: 'FAILED',
        description: 'Insufficient balance for weekly chanda',
      });
      return res.status(400).json({ message: 'Insufficient balance to pay chanda.' });
    }

    // Deduct balance
    currentUser.balance -= amount;
    await currentUser.save();

    // Create success transaction
    const transaction = await Transaction.create({
      userId,
      type: 'CHANDA_PAYMENT',
      amount,
      status: 'SUCCESS',
      description: 'Weekly chanda payment',
    });

    res.json({
      message: 'Chanda payment successful',
      balance: currentUser.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ transactions, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfessions, payChanda, getTransactions };
