const Transaction = require('../models/Transaction');

exports.addTransaction = async (req, res) => {
  try {
    const { userId, amount, type } = req.body;
    const transaction = new Transaction({ userId, amount, type });
    await transaction.save();

    // Update user balance
    const user = await User.findById(userId);
    user.balance += type === 'recharge' ? amount : -amount;
    await user.save();

    res.status(201).json({ message: 'Transaction completed successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error completing transaction', error });
  }
};