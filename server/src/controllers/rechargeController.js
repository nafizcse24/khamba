const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const rechargeBalance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Strict validation to prevent NaN or non-finite exploits
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Amount must be a positive, finite number');
    }

    if (amount > 100000) {
      throw new Error('Maximum recharge limit is BDT 100,000 per transaction');
    }

    // Rate limiting: Prevent duplicate rapid recharges (within 5 seconds) to avoid double-charges
    const recentTx = await Transaction.findOne({
      userId,
      type: 'RECHARGE',
      status: 'SUCCESS',
      amount, // match the exact amount to prevent identical double-clicks
      createdAt: { $gte: new Date(Date.now() - 5 * 1000) }
    }).session(session);

    if (recentTx) {
      throw new Error('Duplicate recharge detected. Please wait a moment.');
    }

    // 1. Check current real-time balance before recharging
    const currentUser = await User.findById(userId).session(session);
    if (!currentUser) {
      throw new Error('User not found');
    }

    if (currentUser.balance >= 100) {
      throw new Error('You can only recharge when your balance is strictly less than BDT 100.');
    }

    // 2. Update the application's internal balance
    currentUser.balance += amount;
    await currentUser.save({ session });

    // 3. Create a RECHARGE transaction
    const transaction = new Transaction({
      userId,
      type: 'RECHARGE',
      amount,
      status: 'SUCCESS',
      description: 'Account balance recharge',
    });

    await transaction.save({ session });

    // 3. Commit the MongoDB session
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      balance: currentUser.balance,
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message || 'Recharge failed' });
  }
};

module.exports = {
  rechargeBalance,
};
