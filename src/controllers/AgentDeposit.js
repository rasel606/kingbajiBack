const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Currency = require('../models/Currency');
const DepositHistory = require('../models/DepositHistory');
const { getOption } = require('../utils/options'); // A utility function for options

// Agent Deposit
router.post('/agent-deposit', async (req, res) => {
    try {
        const { user_id, amount } = req.body;

        // Fetch user and related data
        const user = await User.findById(user_id);
        const currency = await Currency.findById(user.currency_id);
        const agent = await Contact.findById(user.contact_id);

        // Validation checks
        const minAmount = getOption('min_withrow_balance');
        const maxAmount = getOption('max_withrow_balance');

        if (amount < minAmount) {
            return res.json({ status: false, msg: `Minimum Amount is ${minAmount}` });
        }

        if (amount > maxAmount) {
            return res.json({ status: false, msg: `Maximum Amount is ${maxAmount}` });
        }

        if (agent.balance >= amount) {
            // Deposit Logic
            const depositData = new DepositHistory({
                deposit_user_id: user_id,
                transactionID: '--',
                base_amount: amount / currency.price_value,
                currency_rate: currency.price_value,
                amount,
                currency: user.currency_id,
                contact_id: user.contact_id,
                agent_id: user.agent_id,
                gateway: 0,
                gateway_name: 'Agent',
                status: 1,
                remark: `<p><b style='color: red;'>Deposit by Agent directly.</b></p>`
            });

            // Update agent and user balances
            agent.balance -= amount;
            user.balance += amount;

            await agent.save();
            await user.save();
            await depositData.save();

            res.json({ status: true, msg: 'Deposit completed.' });
        } else {
            res.json({ status: false, msg: 'Insufficient balance.' });
        }
    } catch (err) {
        res.json({ status: false, msg: 'Something went wrong.' });
    }
});

module.exports = router;











// MongoDB models (Example)
const Deposit = mongoose.model('Deposit');
const User = mongoose.model('User');

router.post('/deposit/accept', async (req, res) => {
  const depositId = req.body.deposit_id;
  
  try {
    const deposit = await Deposit.findOne({ deposit_id: depositId, status: '0' });
    if (deposit) {
      const amount = deposit.amount;
      const userId = deposit.deposit_user_id;
      
      // Update user balance
      await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
      
      // Mark deposit as accepted
      await Deposit.updateOne({ deposit_id: depositId }, { $set: { status: '1' } });
      
      res.json({ return: true, message: 'Update successful' });
    } else {
      res.json({ return: false, message: 'Something went wrong' });
    }
  } catch (err) {
    console.error(err);
    res.json({ return: false, message: 'Something went wrong' });
  }
});

router.post('/deposit/reject', async (req, res) => {
  const depositId = req.body.deposit_id;
  
  try {
    const result = await Deposit.updateOne({ deposit_id: depositId }, { $set: { status: '2' } });
    
    if (result.modifiedCount > 0) {
      res.json({ return: true, message: 'Update successful' });
    } else {
      res.json({ return: false, message: 'Something went wrong' });
    }
  } catch (err) {
    console.error(err);
    res.json({ return: false, message: 'Something went wrong' });
  }
});





router.post('/withdraw/accept', async (req, res) => {
    const { id, trans_id } = req.body;
    
    try {
      const updateData = { status: '1' };
      if (trans_id) updateData.transactionID = trans_id;
      
      const result = await Withdraw.updateOne({ _id: id }, { $set: updateData });
      
      if (result.modifiedCount > 0) {
        res.json({ return: true, message: 'Update successful' });
      } else {
        res.json({ return: false, message: 'Something went wrong' });
      }
    } catch (err) {
      console.error(err);
      res.json({ return: false, message: 'Something went wrong' });
    }
  });
  
  router.post('/withdraw/reject', async (req, res) => {
    const withdrawId = req.body.id;
    
    try {
      const withdraw = await Withdraw.findOne({ _id: withdrawId, status: '0' });
      
      if (withdraw) {
        const amount = withdraw.amount;
        const userId = withdraw.user_id;
        
        // Refund user balance
        await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
        
        // Mark withdrawal as rejected
        await Withdraw.updateOne({ _id: withdrawId }, { $set: { status: '2' } });
        
        res.json({ return: true, message: 'Update successful' });
      } else {
        res.json({ return: false, message: 'Something went wrong' });
      }
    } catch (err) {
      console.error(err);
      res.json({ return: false, message: 'Something went wrong' });
    }
  });
  