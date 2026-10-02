const mongoose = require('mongoose');
const crypto = require('crypto');

const transactionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['CHANDA_PAYMENT', 'RECHARGE', 'TRANSFER'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    transactionId: { type: String, unique: true, default: () => crypto.randomUUID() },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
