const Transaction = require('../Models/TransactionModel');
const User = require('../Models/User');

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





////////////////////////////////////////////////////////////////





// const express = require('express');
// const mongoose = require('mongoose');
// const User = require('./models/User'); // আপনার User মডেল ইমপোর্ট করুন



// router.post('/deposit', 
//     exports.depositWIthBonus = async (req, res) => {
//     try {
//         const { userId, amount } = req.body;

//         if (!userId || !amount || amount <= 0) {
//             return res.status(400).json({ message: "Invalid deposit amount" });
//         }

//         const user = await User.findOne({ userId });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // ৩.৫% বোনাস হিসাব
//         const bonusAmount = (amount * 3.5) / 100;
//         const totalBalance = user.balance + amount + bonusAmount;

//         user.balance = totalBalance;
//         user.bonus.bonusAmount += bonusAmount;
//         user.bonus.wageringRequirement += (bonusAmount * 10); // ১০x ওয়েজারিং রিকোয়ারমেন্ট
        
//         await user.save();

//         res.json({ message: "Deposit successful", balance: user.balance, bonus: user.bonus });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }









// Admin - Approve or Reject Withdraw Request
// router.post("/admin/withdraw-action", 
    exports.adminWithdrawAction = async (req, res) => {
  try {
      const { transactionID, status } = req.body;
      const transaction = await Transaction.findOne({ transactionID });
      
      if (!transaction) return res.status(404).json({ message: "Transaction not found" });
      if (![1, 2].includes(status)) return res.status(400).json({ message: "Invalid status" });
      
      transaction.status = status;
      await transaction.save();
      
      if (status === Reject) { // If rejected, refund balance
          const user = await User.findById(transaction.user_id);
          user.balance += transaction.amount;
          await user.save();
      }
      
      res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
}






//////////////////////////////////////////////////////////////


// Deposit API
// router.post("/deposit", 
    exports.depositWIthBonus = async (req, res) => {
  try {
      const { userId, amount, gateway, getway_name } = req.body;
      const user = await User.findOne({ userId });
      
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const bonusAmount = amount * 0.035; // 3.5% Bonus
      const totalBalance = user.balance + amount + bonusAmount;
      const wageringRequirement = (amount + bonusAmount) * 10; // Example: 10x turnover
      
      // Update user balance and bonus info
      user.balance = totalBalance;
      user.bonus = {
          name: "Deposit Bonus",
          eligibleGames: [], // Can be assigned specific games
          bonusAmount,
          wageringRequirement,
          isActive: true,
          appliedDate: new Date(),
      };
      await user.save();
      
      // Create transaction record
      const transaction = new Transaction({
          user_id: user._id,
          transactionID: `TXN${Date.now()}`,
          base_amount: amount,
          currency_rate: 1, // Assuming 1:1 for now
          amount: amount + bonusAmount,
          currency_id: "USD", // Change as needed
          agent_id: null,
          gateway,
          getway_name,
          type: "deposit",
          status: 1,
          details: "Deposit with 3.5% Bonus"
      });
      await transaction.save();
      
      res.status(200).json({ message: "Deposit successful", balance: totalBalance, bonus: bonusAmount });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
}







/////////////////////////////////

// Withdraw API (Checks if turnover is complete)
// router.post("/withdraw", 

    exports.withdrawWIthTurenover = async (req, res) => {
  try {
      const { userId, amount } = req.body;
      const user = await User.findOne({ userId });
      
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });
      if (user.bonus.isActive && user.bonus.wageringRequirement > 0) {
          return res.status(400).json({ message: "Turnover requirement not met" });
      }
      
      user.balance -= amount;
      await user.save();
      
      const transaction = new Transaction({
          user_id: user._id,
          transactionID: `TXN${Date.now()}`,
          base_amount: amount,
          currency_rate: 1,
          amount,
          currency_id: "USD",
          gateway: 3,
          getway_name: "Bank",
          type: "withdraw",
          status: 0,
          details: "User withdrawal request"
      });
      await transaction.save();
      
      res.status(200).json({ message: "Withdrawal request submitted", balance: user.balance });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
}




///////////////////



// Update Turnover API
// router.post("/update-turnover", async (req, res) => {
//   try {
//       const { userId, betAmount } = req.body;
//       const user = await User.findOne({ userId });
      
//       if (!user) return res.status(404).json({ message: "User not found" });
//       if (!user.bonus.isActive) return res.status(400).json({ message: "No active bonus" });
      
//       user.bonus.wageringRequirement -= betAmount;
//       if (user.bonus.wageringRequirement <= 0) {
//           user.bonus.isActive = false;
//       }
//       await user.save();
      
//       res.status(200).json({ message: "Turnover updated", remainingTurnover: user.bonus.wageringRequirement });
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//   }
// });




// const express = require('express');
// const User = require('../models/User');

// const router = express.Router();

// সমস্ত ডিপোজিট অনুরোধ
// router.get('/deposits', 
    exports.DepositsList = async (req, res) => {
    try {
        const users = await User.find({}, 'userId name balance bonus');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

// সমস্ত উইথড্র অনুরোধ
// router.get('/withdrawals', 

    exports.WithdrawalsList = async (req, res) => {
    try {
        const users = await User.find({ "withdrawRequest": { $exists: true } }, 'userId name balance withdrawRequest');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}




// router.post('/approve-deposit', 
    exports.approveDeposit = async (req, res) => {
  try {
      const { userId, amount } = req.body;
      const user = await User.findOne({ userId });

      if (!user) return res.status(404).json({ message: "User not found" });

      user.balance += amount;
      await user.save();

      res.json({ message: "Deposit approved", newBalance: user.balance });
  } catch (error) {
      res.status(500).json({ message: "Internal server error" });
  }
}

// উইথড্র অনুমোদন
// router.post('/approve-withdrawal', 
//     exports.approveWithdrawal = async (req, res) => {
//   try {
//       const { userId, amount } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user || user.balance < amount) {
//           return res.status(400).json({ message: "Insufficient balance" });
//       }

//       user.balance -= amount;
//       await user.save();

//       res.json({ message: "Withdrawal approved", remainingBalance: user.balance });
//   } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//   }
// }



// router.post('/update-balance', 
    exports.updateBalance = async (req, res) => {
  try {
      const { userId, amount } = req.body;
      const user = await User.findOne({ userId });

      if (!user) return res.status(404).json({ message: "User not found" });

      user.balance += amount;
      await user.save();

      res.json({ message: "Balance updated", newBalance: user.balance });
  } catch (error) {
      res.status(500).json({ message: "Internal server error" });
  }
}





// router.post('/update-bonus', 
    exports.updateBonus = async (req, res) => {
  try {
      const { userId, bonusAmount, wageringRequirement } = req.body;
      const user = await User.findOne({ userId });

      if (!user) return res.status(404).json({ message: "User not found" });

      user.bonus.bonusAmount = bonusAmount;
      user.bonus.wageringRequirement = wageringRequirement;
      await user.save();

      res.json({ message: "Bonus updated", bonus: user.bonus });
  } catch (error) {
      res.status(500).json({ message: "Internal server error" });
  }
}


// const express = require('express');
// const User = require('../models/User');

// const router = express.Router();

// নির্দিষ্ট ইউজারের টার্নওভার স্ট্যাটাস দেখার API
// router.get('/turnover-status/:userId', 
    exports.getTurnoverStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userId });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            userId: user.userId,
            balance: user.balance,
            bonusAmount: user.bonus.bonusAmount,
            wageringRequirement: user.bonus.wageringRequirement,
            turnoverCompleted: user.bonus.bonusAmount * user.bonus.wageringRequirement, 
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}





////////////////////////////////////////

// router.post('/approve-withdrawal', 
    exports.approveWithdrawal = async (req, res) => {
  try {
      const { userId, amount } = req.body;
      const user = await User.findOne({ userId });

      if (!user) return res.status(404).json({ message: "User not found" });

      // চেক করুন ইউজার টার্নওভার কমপ্লিট করেছে কিনা
      const requiredTurnover = user.bonus.bonusAmount * user.bonus.wageringRequirement;

      if (user.bonus.isActive && requiredTurnover > 0) {
          return res.status(400).json({ message: "Turnover not completed. Withdrawal restricted." });
      }

      if (user.balance < amount) {
          return res.status(400).json({ message: "Insufficient balance" });
      }

      user.balance -= amount;
      await user.save();

      res.json({ message: "Withdrawal approved", remainingBalance: user.balance });
  } catch (error) {
      res.status(500).json({ message: "Internal server error" });
  }
}

