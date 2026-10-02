const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profession: { type: String, required: true },
    balance: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
