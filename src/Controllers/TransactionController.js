const Transaction = require('../Models/TransactionModel');
const User = require('../Models/User');

// exports.addTransaction = async (req, res) => {
//   try {
//     const { userId, amount, type } = req.body;
//     const transaction = new Transaction({ userId, amount, type });
//     await transaction.save();

//     // Update user balance
//     const user = await User.findOne(userId);
//     user.balance += type === 'recharge' ? amount : -amount;
//     await user.save();

//     res.status(201).json({ message: 'Transaction completed successfully', transaction });
//   } catch (error) {
//     res.status(500).json({ message: 'Error completing transaction', error });
//   }
// };





////////////////////////////////////////////////////////////////




// router.post("/deposit", 
exports.addTransaction = async (req, res) => {
    const { userId, amount, gateway_name, referredbyCode } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for referredCode and find the referral
        let referralCode = null;  // Renamed to avoid overwriting `referredbyCode`
        if (referredbyCode) {
            const referredUser = await User.findOne({ referredbyCode });
            if (referredUser) {
                referralCode = referredUser.referredbyCode; // Assign the actual referred user's code
            }
        }

        // Calculate bonus (3.5% of the deposit)
        const bonus = (amount * 3.5) / 100;

        // Create a deposit transaction
        const transactionID = `TXN-${Date.now()}`;
        const newTransaction = new Transaction({
            userId: user.userId,
            transactionID,
            base_amount: amount,
            amount: amount + bonus,
            currency_id: user.currency_id,  // Assuming this is set in User model
            gateway_name: gateway_name,  // Assuming a fixed gateway name for now
            type: 'Deposit',
            status: 0,  // 0 = pending
            referredbyCode: referralCode, // Assign the referral code to the transaction
            is_commission: false,
        });

        // Save the transaction
        await newTransaction.save();

        // If the status is not pending (0), update the user's balance
        if (newTransaction.status !== 0) {
            user.balance += amount + bonus;
            user.bonus.bonusAmount += bonus;
            user.bonus.isActive = true;
            user.bonus.appliedDate = new Date();
            await user.save();
        }

        return res.status(200).json({ success: true, transactionID, balance: user.balance });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};



///////////////////////////////////////////////////////////////

// router.put("/deposit/approve/:transactionID", 
exports.approveDeposit = async (req, res) => {
    try {
        const { userId, referredCode } = req.body;
        const newUser = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for referredCode and find the referral
        let referredbyCode = null;
        if (referredCode) {
            const referredUser = await User.findOne({ referredCode });
            if (referredUser) {
                referredbyCode = referredUser.referredbyCode;
            } else {
                return res.status(400).json({ message: 'Invalid referredCode' });
            }
        }
        const transaction = await Transaction.findOne(userId, { transactionID: req.params.transactionID });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        if (transaction.status !== 0) {
            return res.status(400).json({ message: "Transaction already processed" });
        }

        // ইউজার খুঁজে আপডেট করা
        const user = await User.findOne(transaction.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // ইউজারের ব্যালেন্স আপডেট


        if (transaction.status === 1) { // If rejected, refund balance
            const user = await User.findOne(transaction.userId);
            const bonusAmount = (transaction.amount * 0.35) / 100;
            user.balance += transaction.amount+bonusAmount;
            user.bonus += bonusAmount;
            await user.save();
        }
        // else if(transaction.status === 2){
        //     const user = await User.findOne(transaction.userId);
        //     user.balance -= transaction.amount;
        //     await user.save();
        // }

        // ট্রান্সাকশন স্ট্যাটাস আপডেট
        transaction.status = 1; // Approved
        await transaction.save();

        res.status(200).json({ message: "Deposit approved", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}







exports.approveDepositAdmin = async (req, res) => {
    try {
        const { userId, transactionID } = req.body;

        // Find the user
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the transaction
        const transaction = await Transaction.findOne({ userId, transactionID });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if the transaction status is "Hold" (0)
        if (transaction.status !== 0) {
            return res.status(400).json({ message: "Transaction already processed" });
        }

        // If the transaction is being approved, update the user's balance and bonus
        if (transaction.status === 0) {
            const bonusAmount = (transaction.amount * 0.35) / 100;
            user.balance += transaction.amount + bonusAmount;
            user.bonus += bonusAmount;
            await user.save();
        }

        // Update the transaction status to "Accepted" (1)
        transaction.status = 1;
        await transaction.save();

        res.status(200).json({ message: "Deposit approved", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//////////////////////////////////withdrawWIth///////////////////////////////

exports.withdrawWIth = async (req, res) => {
    const { userId, amount, gateway_name, referredCode } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for referredCode and find the referral
        let referredbyCode = null;
        if (referredCode) {
            const referredUser = await User.findOne({ referredCode });
            if (referredUser) {
                referredbyCode = referredUser.referredbyCode;
            } else {
                return res.status(400).json({ message: 'Invalid referredCode' });
            }
        }

        // Calculate bonus (3.5% of the deposit)
        //   const bonus = amount * 0.35/100;

        // Create a deposit transaction
        const transactionID = `TXN-${Date.now()}`;
        const newTransaction = new Transaction({
            userId: user.userId,
            transactionID,
            base_amount: amount,
            // Assuming 1 as the default currency rate
            // amount: amount + bonus,
            // currency_id: user.currency_id,  // Assuming this is set in User model
            // gateway,
            gateway_name: gateway_name,  // Assuming a fixed gateway name for now
            type: 'Deposit',
            status: 0,  // 0 = pending
            referredbyCode,
            is_commission: false,
            referredbyCode: referredbyCode
        });

        // Save the transaction
        await newTransaction.save();

        // Update the user's balance
        user.balance -= amount;

        await user.save();

        return res.status(200).json({ success: true, transactionID, balance: user.balance });



    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}





///////////////////////////////////////////

exports.approveWidthdraw = async (req, res) => {
    try {
        const { userId, referredCode } = req.body;
        const newUser = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for referredCode and find the referral
        let referredbyCode = null;
        if (referredCode) {
            const referredUser = await User.findOne({ referredCode });
            if (referredUser) {
                referredbyCode = referredUser.referredbyCode;
            } else {
                return res.status(400).json({ message: 'Invalid referredCode' });
            }
        }
        const transaction = await Transaction.findOne(userId, { transactionID: req.params.transactionID });
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        if (transaction.status !== 0) {
            return res.status(400).json({ message: "Transaction already processed" });
        }

        // ইউজার খুঁজে আপডেট করা
        const user = await User.findOne(transaction.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // ইউজারের ব্যালেন্স আপডেট
        const bonusAmount = (transaction.amount * 0.35) / 100;
        user.balance += transaction.amount;
        user.bonus += bonusAmount;
        await user.save();

        // ট্রান্সাকশন স্ট্যাটাস আপডেট
        transaction.status = 1; // Approved
        await transaction.save();

        if (transaction.status === 2) { // If rejected, refund balance
            const user = await User.findOne(transaction.userId);
            user.balance += transaction.amount;
            await user.save();
        }
        else if (transaction.status === 1) {
            const user = await User.findOne(transaction.userId);
            user.balance -= transaction.amount;
            await user.save();
        }

        res.status(200).json({ message: "Deposit approved", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
            const user = await User.findOne(transaction.userId);
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
//     exports.depositWIthBonus = async (req, res) => {
//   try {
//       const { userId, amount, gateway, getway_name } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });

//       const bonusAmount = amount * 0.035; // 3.5% Bonus
//       const totalBalance = user.balance + amount + bonusAmount;
//       const wageringRequirement = (amount + bonusAmount) * 10; // Example: 10x turnover

//       // Update user balance and bonus info
//       user.balance = totalBalance;
//       user.bonus = {
//           name: "Deposit Bonus",
//           eligibleGames: [], // Can be assigned specific games
//           bonusAmount,
//           wageringRequirement,
//           isActive: true,
//           appliedDate: new Date(),
//       };
//       await user.save();

//       // Create transaction record
//       const transaction = new Transaction({
//           userId: user._id,
//           transactionID: `TXN${Date.now()}`,
//           base_amount: amount,
//            // Assuming 1:1 for now
//           amount: amount + bonusAmount,
//           currency_id: "USD", // Change as needed
//           agent_id: null,
//           gateway,
//           getway_name,
//           type: "deposit",
//           status: 1,
//           details: "Deposit with 3.5% Bonus"
//       });
//       await transaction.save();

//       res.status(200).json({ message: "Deposit successful", balance: totalBalance, bonus: bonusAmount });
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//   }
// }







/////////////////////////////////

// Withdraw API (Checks if turnover is complete)
// router.post("/withdraw", 

//     exports.withdrawWIthTurenover = async (req, res) => {
//   try {
//       const { userId, amount } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });
//       if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });
//       if (user.bonus.isActive && user.bonus.wageringRequirement > 0) {
//           return res.status(400).json({ message: "Turnover requirement not met" });
//       }

//       user.balance -= amount;
//       await user.save();

//       const transaction = new Transaction({
//           userId: user._id,
//           transactionID: `TXN${Date.now()}`,
//           base_amount: amount,
//           
//           amount,
//           currency_id: "USD",
//           gateway: 3,
//           getway_name: "Bank",
//           type: "withdraw",
//           status: 0,
//           details: "User withdrawal request"
//       });
//       await transaction.save();

//       res.status(200).json({ message: "Withdrawal request submitted", balance: user.balance });
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//   }
// }




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
    // console.log(req.body);
    try {
        const { referredbyCode } = req.body;
        console.log(referredbyCode);

        // Find the user based on the referredCode
        const users = await User.find({ referredbyCode: referredbyCode });
        console.log(users);
        // If user not found, return 404
        if (!users) {
            return res.status(404).json({ message: 'User not found' });
        }
        const transactions = await Transaction.find({ referredbyCode: referredbyCode });

        const transactionscount = await Transaction.find({ referredbyCode  }).countDocuments();
        // Find transactions for the user

        
        // If no transactions are found, return an empty array
        // if (transactions.length === 0) {
        //     return res.status(404).json({ message: 'No transactions found for this user' });
        // }

        // Return the found transactions
        res.status(200).json({ transactionscount, transactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}





///////////////////////////////////////

exports.AdminDepositsList = async (req, res) => {
    try {


        // Find the user based on the referredCode
        const users = await User.findOne({});

        // If user not found, return 404
        if (!users) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find transactions for the user


        const transactions = await Transaction.find({});

        // If no transactions are found, return an empty array
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this user' });
        }

        // Return the found transactions
        res.json(transactions);

    } catch (error) {
        console.error(error);
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
//     exports.approveDeposit = async (req, res) => {
//   try {
//       const { userId, amount } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });

//       user.balance += amount;
//       await user.save();

//       res.json({ message: "Deposit approved", newBalance: user.balance });
//   } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//   }
// }

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
//     exports.updateBalance = async (req, res) => {
//   try {
//       const { userId, amount } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });

//       user.balance += amount;
//       await user.save();

//       res.json({ message: "Balance updated", newBalance: user.balance });
//   } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//   }
// }





// router.post('/update-bonus',
//     exports.updateBonus = async (req, res) => {
//   try {
//       const { userId, bonusAmount, wageringRequirement } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });

//       user.bonus.bonusAmount = bonusAmount;
//       user.bonus.wageringRequirement = wageringRequirement;
//       await user.save();

//       res.json({ message: "Bonus updated", bonus: user.bonus });
//   } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//   }
// }


// const express = require('express');
// const User = require('../models/User');

// const router = express.Router();

// নির্দিষ্ট ইউজারের টার্নওভার স্ট্যাটাস দেখার API
// router.get('/turnover-status/:userId',
//     exports.getTurnoverStatus = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const user = await User.findOne({ userId });

//         if (!user) return res.status(404).json({ message: "User not found" });

//         res.json({
//             userId: user.userId,
//             balance: user.balance,
//             bonusAmount: user.bonus.bonusAmount,
//             wageringRequirement: user.bonus.wageringRequirement,
//             turnoverCompleted: user.bonus.bonusAmount * user.bonus.wageringRequirement,
//         });

//     } catch (error) {
//         res.status(500).json({ message: "Internal server error" });
//     }
// }





////////////////////////////////////////

// router.post('/approve-withdrawal',
//     exports.approveWithdrawal = async (req, res) => {
//   try {
//       const { userId, amount } = req.body;
//       const user = await User.findOne({ userId });

//       if (!user) return res.status(404).json({ message: "User not found" });

//       // চেক করুন ইউজার টার্নওভার কমপ্লিট করেছে কিনা
//       const requiredTurnover = user.bonus.bonusAmount * user.bonus.wageringRequirement;

//       if (user.bonus.isActive && requiredTurnover > 0) {
//           return res.status(400).json({ message: "Turnover not completed. Withdrawal restricted." });
//       }

//       if (user.balance < amount) {
//           return res.status(400).json({ message: "Insufficient balance" });
//       }

//       user.balance -= amount;
//       await user.save();

//       res.json({ message: "Withdrawal approved", remainingBalance: user.balance });
//   } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//   }
// }

