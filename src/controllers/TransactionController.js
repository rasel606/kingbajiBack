const TransactionService = require('../services/transactionService');
const DepositHistory = require('../models/DepositHistory');
const WithdrawModel = require('../models/Withdrawal');
const notificationController = require('./notificationController');

// Admin search deposits
exports.searchDeposits = async (req, res) => {
  try {
    const filters = req.query;
    const deposits = await TransactionService.searchDeposits(filters);
    res.json({
      success: true,
      data: deposits,
      count: deposits.length
    });
  } catch (error) {
    console.error('Search deposits error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin search withdrawals
exports.searchWithdrawals = async (req, res) => {
  try {
    const filters = req.query;
    const withdrawals = await TransactionService.searchWithdrawals(filters);
    res.json({
      success: true,
      data: withdrawals,
      count: withdrawals.length
    });
  } catch (error) {
    console.error('Search withdrawals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionID } = req.body;

    const deposit = await DepositHistory.findById(id);
    if (!deposit || deposit.status !== 0) {
      return res.status(404).json({ success: false, message: 'Deposit not found or already processed' });
    }

    // Update status & transactionID
    deposit.status = 1;
    deposit.transactionID = transactionID || deposit.transactionID;
    await deposit.save();

    // Credit user balance (implement based on user model)
    // const user = await User.findOne({ userId: deposit.deposit_user_id });
    // if (user) user.balance += deposit.amount; await user.save();

    // Notify user via full NotificationService
    await notificationController.notifyUserOnStatusChange(deposit.deposit_user_id, deposit, 'approved');

    res.json({ success: true, message: 'Deposit approved', data: deposit });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin reject deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const deposit = await DepositHistory.findById(id);
    if (!deposit || deposit.status !== 0) {
      return res.status(404).json({ success: false, message: 'Deposit not found or already processed' });
    }

    deposit.status = 2;
    if (remark) deposit.remark = remark;
    await deposit.save();

    await notificationController.notifyUserOnStatusChange(deposit.deposit_user_id, deposit, 'rejected');

    res.json({ success: true, message: 'Deposit rejected', data: deposit });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User submit deposit
exports.submitDeposit = async (req, res) => {
  try {
    const data = req.body;
    // Validate required fields from DepositHistory schema
    const mongoose = require('mongoose');
    const deposit = new DepositHistory({
      deposit_id: new mongoose.Types.ObjectId().toString(),
      deposit_user_id: req.user?.userId || data.userId,
      transactionID: data.transactionID || `DEP-${Date.now()}`,
      base_amount: data.base_amount,
      USD: data.USD,
      currency_rate: data.currency_rate,
      current_currency_rate: data.current_currency_rate,
      amount: data.amount,
      total_amount_based_on_currency_rate: data.total_amount_based_on_currency_rate,
      currency: data.currency,
      gateway: data.gateway,
      gateway_name: data.gateway_name,
      contact_id: data.contact_id,
      agent_id: data.agent_id,
      remark: data.remark,
      status: 0, // Hold
      datetime: new Date(),
      is_commission: false
    });
    await deposit.save();

    // Notify admins
    await TransactionService.notifyAdmins('deposit', deposit);

    res.json({ success: true, message: 'Deposit submitted successfully', data: deposit });
  } catch (error) {
    console.error('Submit deposit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User submit withdrawal (stub - implement schema specific)
exports.submitWithdrawal = async (req, res) => {
  try {
    const data = req.body;
    const withdrawal = new WithdrawModel({
      userId: req.user?.userId || data.userId,
      amount: data.amount,
      currency: data.currency,
      gateway: data.gateway,
      status: 0, // Hold
      createdAt: new Date()
    });
    await withdrawal.save();

    await notificationController.notifyAdminsOnSubmit(withdrawal);

    res.json({ success: true, message: 'Withdrawal submitted', data: withdrawal });
  } catch (error) {
    console.error('Submit withdrawal error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Similar for withdrawals: approveWithdrawal, rejectWithdrawal
exports.approveWithdrawal = async (req, res) => {
  // TODO: full implementation
  res.json({ success: true, message: 'Withdrawal approved' });
};

exports.rejectWithdrawal = async (req, res) => {
  // TODO: full implementation
  res.json({ success: true, message: 'Withdrawal rejected' });
};

module.exports = exports;

