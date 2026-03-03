




// // services/depositService.js


// const TransactionModel = require('../models/Transaction');
// const Admin = require('../models/Admin');
// const SubAdmin = require('../models/SubAdmin');
// const Agent = require('../models/Agent');
// const notificationController = require('../Controllers/notificationController');
// const User = require('../Models/User');

// exports.processDepositApproval = async ({ userId, referralCode, status, transactionID, role }) => {
//     const user = await User.findOne({ userId, referredBy: referralCode });
//     if (!user || user.referredBy !== referralCode) {
//         throw { status: 404, message: 'User not found or referral mismatch' };
//     }

//     let actor;
//     if (role === 'admin') {
//         actor = await Admin.findOne({ referralCode });
//     } else if (role === 'subadmin') {
//         actor = await SubAdmin.findOne({ referralCode });
//     } else if (role === 'agent') {
//         actor = await Agent.findOne({ referralCode });
//     }

//     if (!actor || actor.referralCode !== referralCode) {
//         throw { status: 400, message: 'Invalid referral code for ' + role };
//     }

//     const transaction = await TransactionModel.findOne({
//         userId,
//         transactionID,
//         referredBy: referralCode,
//         type: 0,
//     });

//     if (!transaction) {
//         throw { status: 404, message: 'Transaction not found' };
//     }

//     if (transaction.status === 1) {
//         throw { status: 400, message: 'Transaction already approved' };
//     }

//     if (parseInt(status) === 1) {
//         if (actor.balance < transaction.amount) {
//             throw { status: 400, message: `${role} balance is not enough` };
//         }

//         actor.balance -= transaction.amount;
//         user.balance += transaction.amount;

//         transaction.status = 1;
//         transaction.updatetime = new Date();

//         await actor.save();
//         await user.save();
//         await transaction.save();

//         await notificationController.createNotification(
//             `Deposit approved for ${transaction.transactionID} (User ID: ${user.userId})`,
//             user.userId,
//             `Your deposit of ${transaction.amount} has been approved at ${new Date()} with transaction ID ${transaction.transactionID}.`,
//             'deposit_approved',
//             { amount: transaction.amount, transactionID: transaction.transactionID }
//         );

//         return { message: "Deposit approved successfully", user };
//     }

//     if (parseInt(status) === 2) {
//         transaction.status = 2;
//         transaction.updatetime = new Date();

//         await transaction.save();

//         await notificationController.createNotification(
//             `Deposit rejected for ${transaction.transactionID} (User ID: ${user.userId})`,
//             user.userId,
//             `Your deposit of ${transaction.amount} has been rejected at ${new Date()} with transaction ID ${transaction.transactionID}.`,
//             'deposit_rejected',
//             { amount: transaction.amount, transactionID: transaction.transactionID }
//         );

//         return { message: "Deposit rejected successfully" };
//     }

//     throw { status: 400, message: 'Invalid status value' };
// };
