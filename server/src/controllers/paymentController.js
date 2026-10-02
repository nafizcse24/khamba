const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const professions = require('../config/professions');

const getProfessions = (req, res) => {
  const professionList = Object.keys(professions).map((key) => ({
    name: key,
    amount: professions[key] / 4, // Divided per week
  }));
  res.json(professionList);
};

const payChanda = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // 1. Read user's profession
    const currentUser = await User.findById(userId).session(session);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // 2. Determine correct weekly chanda amount on server
    const baseAmount = professions[currentUser.profession];
    if (!baseAmount) {
      throw new Error('Invalid profession assigned to user');
    }
    const amount = baseAmount / 4;

    // 3. Prevent duplicate payment within the rolling week (7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTx = await Transaction.findOne({
      userId,
      type: 'CHANDA_PAYMENT',
      status: 'SUCCESS',
      createdAt: { $gte: oneWeekAgo } 
    }).session(session);

    if (recentTx) {
      throw new Error('You have already paid your chanda for this week. Please wait until next week.');
    }

    // 4. Atomically check balance and deduct amount within session
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    if (!updatedUser) {
      // We must abort transaction and log failed outside the session
      await session.abortTransaction();
      session.endSession();
      
      // Log failed transaction outside session so it persists
      await Transaction.create({
        userId,
        type: 'CHANDA_PAYMENT',
        amount,
        status: 'FAILED',
        description: 'Insufficient balance for weekly chanda',
      });
      return res.status(400).json({ message: 'Insufficient balance to pay chanda.' });
    }

    // 5. Create successful transaction
    const transaction = new Transaction({
      userId,
      type: 'CHANDA_PAYMENT',
      amount,
      status: 'SUCCESS',
      description: 'Weekly chanda payment',
    });

    await transaction.save({ session });

    // 6. Commit the session
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Chanda payment successful',
      balance: updatedUser.balance,
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Server error' });
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

    res.json({
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProfessions,
  payChanda,
  getTransactions,
};
