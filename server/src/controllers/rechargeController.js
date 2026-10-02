const User = require('../models/User');
const Transaction = require('../models/Transaction');

const rechargeBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Strict validation
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive, finite number' });
    }

    if (amount > 100000) {
      return res.status(400).json({ message: 'Maximum recharge limit is BDT 100,000 per transaction' });
    }

    // Prevent duplicate rapid recharges within 5 seconds
    const recentTx = await Transaction.findOne({
      userId,
      type: 'RECHARGE',
      status: 'SUCCESS',
      amount,
      createdAt: { $gte: new Date(Date.now() - 5 * 1000) }
    });

    if (recentTx) {
      return res.status(400).json({ message: 'Duplicate recharge detected. Please wait a moment.' });
    }

    // Check current balance
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.balance >= 100) {
      return res.status(400).json({ message: 'You can only recharge when your balance is strictly less than BDT 100.' });
    }

    // Update balance
    currentUser.balance += amount;
    await currentUser.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: 'RECHARGE',
      amount,
      status: 'SUCCESS',
      description: 'Account balance recharge',
    });

    res.json({ success: true, balance: currentUser.balance, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Recharge failed' });
  }
};

module.exports = { rechargeBalance };
