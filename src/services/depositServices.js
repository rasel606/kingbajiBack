// const express = require('express');
// const router = express.Router();
// const { Transaction, User, Bonus, UserBonus, PaymentGateWayTable } = require('../Models');
// const { 
//   generateTransactionID, 
//   calculateBonus, 
//   verifyPaymentGateway 
// } = require('../utils/helpers');

// // ডিপোজিট ইনিশিয়েট

// //router.post('/initiate',
// exports.depositInitiate = async (req, res) => {
//   try {
//     const {
//       userId,
//       base_amount,
//       gateway_name,
//       payment_type,
//       mobile,
//       gateway_Number,
//       promotionId,
//       details
//     } = req.body;

//     // ইউজার ভেরিফিকেশন
//     const user = await User.findOne({ userId });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'ইউজার খুঁজে পাওয়া যায়নি'
//       });
//     }

//     // পেমেন্ট গেটওয়ে ভেরিফিকেশন
//     const paymentGateway = await PaymentGateWayTable.findOne({
//       gateway_name,
//       payment_type,
//       is_active: true
//     });

//     if (!paymentGateway) {
//       return res.status(400).json({
//         success: false,
//         message: 'পেমেন্ট গেটওয়ে Available নেই'
//       });
//     }

//     // গেটওয়ে ভেরিফিকেশন
//     verifyPaymentGateway(paymentGateway, base_amount);

//     // প্রমোশন/বোনাস চেক
//     let bonusAmount = 0;
//     let bonusId = null;
//     let bonusConfig = null;

//     if (promotionId && promotionId !== '4') { // 4 = নরমাল ডিপোজিট
//       bonusConfig = await Bonus.findById(promotionId);
//       if (bonusConfig && bonusConfig.isActive) {
//         bonusAmount = calculateBonus(base_amount, 'percentage', {
//           percentage: bonusConfig.percentage,
//           maxBonus: bonusConfig.maxBonus
//         });
//       }
//     }

//     // টোটাল Amount
//     const totalAmount = base_amount + bonusAmount;

//     // ট্রানজেকশন আইডি জেনারেট
//     const transactionID = generateTransactionID();

//     // রেফারেল থেকে বোনাস/ডিপোজিট ডিডাকশন লজিক
//     let bonusDeductedFrom = null;
//     let depositDeductedFrom = null;

//     if (user.referredBy && user.referredByType) {
//       // বোনাস ডিডাকশন - রেফারার থেকে কাটা হবে
//       if (bonusAmount > 0) {
//         bonusDeductedFrom = user.referredBy;
        
//         // রেফারারের ব্যালেন্স থেকে বোনাস Amount ডিডাক্ট
//         await deductFromReferrer(user.referredBy, user.referredByType, bonusAmount, 'bonus');
//       }

//       // ডিপোজিট ডিডাকশন - রেফারার থেকে কাটা হবে
//       depositDeductedFrom = user.referredBy;
//       await deductFromReferrer(user.referredBy, user.referredByType, base_amount, 'deposit');
//     }

//     // নতুন ট্রানজেকশন ক্রিয়েট
//     const newTransaction = new Transaction({
//       userId,
//       transactionID,
//       base_amount,
//       bonus_amount: bonusAmount,
//       amount: totalAmount,
//       mobile,
//       gateway_Number,
//       gateway_name,
//       payment_type,
//       type: 0, // Deposit
//       status: 0, // Hold
//       details,
//       bonusId: promotionId !== '4' ? promotionId : null,
//       isBonusApplied: bonusAmount > 0,
//       bonusStatus: bonusAmount > 0 ? 'pending' : undefined,
//       turnoverRequirement: bonusConfig ? bonusConfig.wageringRequirement * totalAmount : 0,
//       referredBy: user.referredBy,
//       referredByType: user.referredByType,
//       bonusDeductedFrom,
//       depositDeductedFrom,
//       paymentGatewayOwner: paymentGateway.user_role
//     });

//     await newTransaction.save();

//     // ইউজার বোনাস রেকর্ড যদি বোনাস Applied হয়
//     if (bonusAmount > 0 && bonusConfig) {
//       const userBonus = new UserBonus({
//         userId,
//         bonusId: promotionId,
//         amount: bonusAmount,
//         remainingAmount: bonusAmount,
//         bonusType: bonusConfig.bonusType,
//         turnoverRequirement: bonusConfig.wageringRequirement * totalAmount,
//         status: 'active',
//         expiryDate: new Date(Date.now() + (bonusConfig.validDays * 24 * 60 * 60 * 1000)),
//         transactionId: transactionID,
//         referredBy: user.referredBy
//       });

//       await userBonus.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: 'ডিপোজিট সফলভাবে Initiate হয়েছে',
//       data: {
//         transactionID,
//         base_amount,
//         bonus_amount: bonusAmount,
//         total_amount: totalAmount,
//         gateway_number: paymentGateway.gateway_Number,
//         payment_type,
//         status: 'hold'
//       }
//     });

//   } catch (error) {
//     console.error('Deposit Initiate Error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'ডিপোজিট Initiate করতে সমস্যা হয়েছে'
//     });
//   }
// }

// // রেফারার থেকে Amount ডিডাক্ট করার ফাংশন
// const deductFromReferrer = async (referrerId, referrerType, amount, deductionType) => {
//   try {
//     let referrer;
    
//     switch (referrerType) {
//       case 'Admin':
//         referrer = await AdminModel.findOne({ userId: referrerId });
//         break;
//       case 'SubAdmin':
//         referrer = await SubAdmin.findOne({ SubAdminId: referrerId });
//         break;
//       case 'Affiliate':
//         referrer = await AffiliateModel.findOne({ userId: referrerId });
//         break;
//       case 'User':
//         referrer = await User.findOne({ userId: referrerId });
//         break;
//     }

//     if (!referrer) {
//       throw new Error('রেফারার খুঁজে পাওয়া যায়নি');
//     }

//     // ব্যালেন্স চেক
//     if (referrer.balance < amount) {
//       throw new Error('রেফারারের পর্যাপ্ত ব্যালেন্স নেই');
//     }

//     // ব্যালেন্স আপডেট
//     referrer.balance -= amount;
//     await referrer.save();

//     // ডিডাকশন হিস্ট্রি রেকর্ড (ঐচ্ছিক)
//     const deductionTransaction = new Transaction({
//       userId: referrerId,
//       transactionID: generateTransactionID(),
//       base_amount: amount,
//       amount: amount,
//       type: deductionType === 'bonus' ? 2 : 0, // Bonus or Deposit
//       status: 1, // Accepted
//       gateway_name: 'system',
//       payment_type: 'transfer',
//       details: `${deductionType === 'bonus' ? 'বোনাস' : 'ডিপোজিট'} ডিডাকশন - রেফারেল ইউজার`,
//       referredBy: referrerId,
//       datetime: new Date()
//     });

//     await deductionTransaction.save();

//   } catch (error) {
//     throw error;
//   }
// };

// // ডিপোজিট কনফার্মেশন

// //router.post('/confirm',
// exports.confirmDeposit = async (req, res) => {
//   try {
//     const { transactionID, otpOrTrxID } = req.body;

//     const transaction = await Transaction.findOne({ transactionID });
//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: 'ট্রানজেকশন খুঁজে পাওয়া যায়নি'
//       });
//     }

//     // OTP/TRX ID ভেরিফিকেশন (এখানে Actual লজিক ইম্প্লিমেন্ট করতে হবে)
//     const isVerified = await verifyOTPOrTrxID(otpOrTrxID, transaction);

//     if (!isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP/TRX ID ভুল হয়েছে'
//       });
//     }

//     // ট্রানজেকশন স্ট্যাটাস আপডেট
//     transaction.status = 1; // Accepted
//     transaction.updatetime = new Date();
//     await transaction.save();

//     // ইউজার ব্যালেন্স আপডেট
//     const user = await User.findOne({ userId: transaction.userId });
//     user.balance += transaction.amount;
//     user.totalBonus += transaction.bonus_amount;
//     await user.save();

//     // ইউজার বোনাস স্ট্যাটাস আপডেট
//     if (transaction.isBonusApplied) {
//       await UserBonus.findOneAndUpdate(
//         { transactionId: transactionID },
//         { status: 'active' }
//       );
//     }

//     res.status(200).json({
//       success: true,
//       message: 'ডিপোজিট সফলভাবে Confirm হয়েছে',
//       data: {
//         transactionID,
//         amount: transaction.amount,
//         new_balance: user.balance
//       }
//     });

//   } catch (error) {
//     console.error('Deposit Confirm Error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'ডিপোজিট Confirm করতে সমস্যা হয়েছে'
//     });
//   }
// }

// // OTP/TRX ID ভেরিফিকেশন ফাংশন (মক)
// const verifyOTPOrTrxID = async (otpOrTrxID, transaction) => {
//   // এখানে Actual Payment Gateway API Call করতে হবে
//   // এখন মক রেসপন্স দিচ্ছি
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true); // সবসময় True Return করছে
//     }, 1000);
//   });
// };

// // ডিপোজিট হিস্ট্রি
// // router.get('/history/:userId', 
    
//    exports.getDepositHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     const transactions = await Transaction.find({ userId })
//       .sort({ datetime: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .exec();

//     const total = await Transaction.countDocuments({ userId });

//     res.status(200).json({
//       success: true,
//       data: {
//         transactions,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         total
//       }
//     });

//   } catch (error) {
//     console.error('Deposit History Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'ডিপোজিট হিস্ট্রি লোড করতে সমস্যা হয়েছে'
//     });
//   }
// }

const express = require('express');
const router = express.Router();
const Transaction = require('../Models/Transaction');
const User = require('../Models/User');
const Bonus = require('../Models/Bonus');
const UserBonus = require('../Models/UserBonus');
const { getReferralOwner } = require('../utils/referralUtils');
const NotificationService = require('../services/notificationService');
const AuditService = require('../Services/auditService');

// ডিপোজিট তৈরি করুন (নোটিফিকেশন ও অডিট সহ)
router.post('/deposit', async (req, res) => {
    try {
        const {
            userId,
            base_amount,
            mobile,
            gateway_name,
            gateway_Number,
            payment_type,
            details
        } = req.body;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactionID = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
        const referralOwner = await getReferralOwner(user.referredBy);
        
        let bonus_amount = 0;
        let bonusId = null;
        let isBonusApplied = false;

        // বোনাস প্রয়োগ
        const applicableBonus = await Bonus.findOne({
            bonusType: 'deposit',
            isActive: true,
            minDeposit: { $lte: base_amount },
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (applicableBonus) {
            if (applicableBonus.percentage) {
                bonus_amount = (base_amount * applicableBonus.percentage) / 100;
                if (applicableBonus.maxBonus && bonus_amount > applicableBonus.maxBonus) {
                    bonus_amount = applicableBonus.maxBonus;
                }
            } else if (applicableBonus.fixedAmount) {
                bonus_amount = applicableBonus.fixedAmount;
            }
            
            bonusId = applicableBonus._id;
            isBonusApplied = true;

            const userBonus = new UserBonus({
                userId,
                bonusId: applicableBonus._id,
                amount: bonus_amount,
                remainingAmount: bonus_amount,
                bonusType: applicableBonus.bonusType,
                turnoverRequirement: applicableBonus.wageringRequirement * bonus_amount,
                completedTurnover: 0,
                status: 'active',
                expiryDate: new Date(Date.now() + applicableBonus.validDays * 24 * 60 * 60 * 1000),
                transactionId: transactionID
            });
            await userBonus.save();

            // বোনাস নোটিফিকেশন
            await NotificationService.sendBonusNotification(
                userId, 
                'User', 
                userBonus, 
                'bonus_credited'
            );
        }

        const total_amount = base_amount + bonus_amount;

        const transaction = new Transaction({
            userId,
            transactionID,
            base_amount,
            bonus_amount,
            amount: total_amount,
            mobile,
            gateway_name,
            gateway_Number,
            type: 0,
            status: 0,
            details,
            payment_type,
            bonusId,
            isBonusApplied,
            bonusStatus: isBonusApplied ? 'active' : 'pending',
            turnoverRequirement: isBonusApplied ? (applicableBonus.wageringRequirement * bonus_amount) : 0,
            referredBy: user.referredBy,
            paymentGatewayOwner: referralOwner ? referralOwner.role : 'Admin'
        });

        await transaction.save();

        // নোটিফিকেশন পাঠান
        await NotificationService.sendTransactionNotification(
            userId,
            'User',
            transaction,
            'deposit_hold'
        );

        // অডিট লগ তৈরি করুন
        await AuditService.logTransactionAction(
            'DEPOSIT_CREATE',
            userId,
            'User',
            transaction,
            req.ip,
            req.get('User-Agent')
        );

        // রেফারেল বোনাস ডিডাকশন
        if (referralOwner && isBonusApplied) {
            await handleReferralBonusDeduction(referralOwner, bonus_amount, transactionID, user, req);
        }

        res.status(201).json({
            message: 'Deposit transaction created successfully',
            transaction: transaction
        });

    } catch (error) {
        // এরর অডিট লগ
        await AuditService.createAuditLog({
            action: 'DEPOSIT_CREATE_ERROR',
            performedBy: req.body.userId || 'unknown',
            userType: 'User',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            status: 'failed',
            errorMessage: error.message
        });

        res.status(500).json({ message: error.message });
    }
});

// ট্রানজেকশন স্ট্যাটাস আপডেট (নোটিফিকেশন ও অডিট সহ)
router.put('/:transactionId/status', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status, adminId } = req.body;

        const transaction = await Transaction.findOne({ transactionID: transactionId });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const oldStatus = transaction.status;
        transaction.status = status;
        transaction.updatetime = new Date();
        await transaction.save();

        // নোটিফিকেশন
        if (status === 1) {
            if (transaction.type === 0) {
                await NotificationService.sendTransactionNotification(
                    transaction.userId,
                    'User',
                    transaction,
                    'deposit_approved'
                );
                await handleAcceptedDeposit(transaction);
            } else if (transaction.type === 1) {
                await NotificationService.sendTransactionNotification(
                    transaction.userId,
                    'User',
                    transaction,
                    'withdrawal_approved'
                );
                await handleAcceptedWithdrawal(transaction);
            }
        }

        // অডিট লগ
        await AuditService.logTransactionAction(
            'TRANSACTION_STATUS_UPDATE',
            adminId || 'system',
            'Admin',
            transaction,
            req.ip,
            req.get('User-Agent')
        );

        res.json({
            message: 'Transaction status updated successfully',
            transaction: transaction
        });

    } catch (error) {
        await AuditService.createAuditLog({
            action: 'TRANSACTION_STATUS_UPDATE_ERROR',
            performedBy: req.body.adminId || 'unknown',
            userType: 'Admin',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            status: 'failed',
            errorMessage: error.message
        });

        res.status(500).json({ message: error.message });
    }
});

// হেল্পার ফাংশনগুলো আগের মতোই (নোটিফিকেশন ও অডিট যোগ করুন)
async function handleReferralBonusDeduction(referralOwner, bonusAmount, transactionId, user, req) {
    try {
        const deductionTransaction = new Transaction({
            userId: referralOwner.owner.userId || referralOwner.owner._id.toString(),
            transactionID: 'DED' + Date.now(),
            base_amount: bonusAmount,
            bonus_amount: 0,
            amount: bonusAmount,
            mobile: user.phone[0]?.number || '0000000000',
            gateway_name: 'transfer',
            type: 3,
            status: 1,
            details: `Bonus deduction for user ${user.userId}`,
            payment_type: 'transfer',
            is_commission: true,
            referredBy: user.referredBy,
            paymentGatewayOwner: referralOwner.role
        });

        await deductionTransaction.save();

        // নোটিফিকেশন
        await NotificationService.createNotification({
            userId: referralOwner.owner.userId || referralOwner.owner._id.toString(),
            userType: referralOwner.role,
            title: 'বোনাস ডিডাকশন',
            message: `আপনার অ্যাকাউন্ট থেকে ${bonusAmount} টাকা বোনাস ডিডাক্ট করা হয়েছে।`,
            type: 'transaction',
            relatedId: deductionTransaction.transactionID,
            priority: 'medium'
        });

        // অডিট লগ
        await AuditService.logTransactionAction(
            'BONUS_DEDUCTION',
            'system',
            'System',
            deductionTransaction,
            req.ip,
            req.get('User-Agent')
        );

        // ব্যালেন্স আপডেট
        if (referralOwner.role === 'affiliate') {
            await AffiliateModel.findByIdAndUpdate(
                referralOwner.owner._id,
                { $inc: { balance: -bonusAmount, negativeBalance: bonusAmount } }
            );
        } else if (referralOwner.role === 'subadmin') {
            await SubAdmin.findByIdAndUpdate(
                referralOwner.owner._id,
                { $inc: { balance: -bonusAmount } }
            );
        }

    } catch (error) {
        console.error('Error in referral bonus deduction:', error);
    }
}

// অন্যান্য হেল্পার ফাংশনগুলো আগের মতোই রাখুন