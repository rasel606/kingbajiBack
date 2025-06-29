const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const Transaction = require('../Models/TransactionModel');
const User = require('../Models/User');
const SubAdmin = require('../Models/SubAdminModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const TransactionModel = require('../Models/TransactionModel');
const notificationController = require('../Controllers/notificationController');
const generateReferralCode = require('../Services/generateReferralCode');
const WidthralPaymentGateWayTable = require('../Models/WidthralPaymentGateWayTable');
const Bonus = require('../Models/Bonus');
const UserBonus = require('../Models/UserBonus');
const BettingHistory = require('../Models/BettingHistory');

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


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";


////////////////////////////////////////////////////////////////
// app.post("/process-payment", async (req, res) => {
//     const { userId, amount, method } = req.body;

//     // Fetch user data from the database
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Generate the redirect URL with user details


//   });




// router.post("/deposit", 
exports.addTransaction = async (req, res) => {
    const { userId, amount, gateway_name, gateway_Number, payment_type, referredBy } = req.body;
    console.log(req.body);
    console.log(payment_type);
    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for referredCode and find the referral
        let referralCode = null;  // Renamed to avoid overwriting `referredBy`
        if (referredBy) {
            const referredUser = await User.findOne({ referredBy });
            if (referredUser) {
                referralCode = referredUser.referredBy; // Assign the actual referred user's code
            }
        }



        const token = jwt.sign({ id: user.userId }, JWT_SECRET, { expiresIn: "2h" });

        let redirectUrl = `http://localhost:3001/${encodeURIComponent(gateway_name)}?userId=${encodeURIComponent(user.userId)}&name=${encodeURIComponent(user.name)}&amount=${encodeURIComponent(amount)}&referredBy=${encodeURIComponent(referredBy || '')}&payment_type=${encodeURIComponent(payment_type)}&gateway_Number=${encodeURIComponent(gateway_Number)}&token=${encodeURIComponent(token)}&type=${encodeURIComponent(0)}`;
        res.json(redirectUrl);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};



// app.post("/api/v1/submitTransaction", 













////////////////////////////////////////////////////////////////// user trnx /////////////////
exports.submitTransaction = async (req, res) => {
    console.log("req.body  --------- 1 ", req.body);

    try {
        const {
            userId,
            gateway_name,
            base_amount,
            referredBy,
            payment_type,
            gateway_Number,
            transactionID,
            bonusCode
        } = req.body;

        console.log("Incoming Request Body: -------------1", req.body);

        // Validate required fields
        if (!userId || !base_amount || !referredBy || !payment_type || !transactionID || !gateway_name || !gateway_Number) {
            return res.status(400).json({ error: "All fields are required." });
        }
        console.log("Incoming Request Body:", req.body);
        // Validate base_amount is a number
        const baseAmount = parseFloat(base_amount);
        if (isNaN(baseAmount) || baseAmount <= 0) {
            return res.status(400).json({ error: "Invalid base amount" });
        }

        // Optionally validate transaction ID format
        // if (!/^[a-zA-Z0-9]{10}$/.test(transactionID)) {
        //     return res.status(400).json({ error: "Invalid transaction ID format." });
        // }

        // Find user
        const user = await User.findOne({ userId, referredBy });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if transaction already exists
        const existingTransaction = await Transaction.findOne({
            userId,
            referredBy: user.referredBy,
            transactionID,
            payment_type
        });

        if (existingTransaction) {
            return res.status(409).json({ message: 'Transaction already used' });
        }

        let bonusAmount = 0;
        let bonusId = null;
        let turnoverRequirement = 0;
        const bonusType = 'deposit';
        const totalAmount = baseAmount + bonusAmount;
        const depositBonus = null

        if (baseAmount >= 200) { // Minimum deposit for bonus
            const depositBonus = await Bonus.findOne({
                bonusType: 'deposit',
                isActive: true,
                minDeposit: { $lte: baseAmount },
                _id: bonusCode
            }).sort({ minDeposit: -1 }); // Get the best matching bonus


            console.log("depositBonus", depositBonus);
            if (depositBonus) {
                // Calculate bonus amount
                bonusAmount = depositBonus.fixedAmount ||
                    Math.floor((baseAmount * depositBonus.percentage) / 100);

                // Apply max bonus limit if exists
                if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus) {
                    bonusAmount = depositBonus.maxBonus;
                }

                bonusId = depositBonus._id;
                turnoverRequirement = (baseAmount + bonusAmount) * depositBonus.wageringRequirement;
            }
        }
        console.log("depositBonus", depositBonus, "bonusAmount", bonusAmount, "turnoverRequirement", turnoverRequirement);
        // Calculate 4% bonus
        const type = 0; // static type
        const status = 0; // pending

        // Create new transaction
        const newTransaction = await Transaction.create({
            userId: user.userId,
            transactionID,
            base_amount: baseAmount,
            bonus_amount: bonusAmount,
            amount: baseAmount + bonusAmount,
            gateway_name,
            gateway_Number,
            payment_type,
            mobile: user.phone[0]?.number || '', // fallback if phone[0] is undefined
            type,
            status,
            referredBy: user.referredBy,
            is_commission: false,
            bonusId,
            isBonusApplied: bonusAmount > 0,
            bonusStatus: bonusAmount > 0 ? 'pending' : undefined,
            turnoverRequirement: turnoverRequirement,
            expiryDate: bonusAmount > 0 ?
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days expiry
        });

        console.log("Transaction Created:", newTransaction);

        await notificationController.createNotification(
            `Deposit Request by ${user.name} (User ID: ${user.userId})`,
            newTransaction.userId,
            `deposit of ${newTransaction.amount} has been submitted at ${new Date()}  by ${newTransaction.gateway_name}.
            Please note that Your deposit request of ${newTransaction.amount} has been send at ${new Date()} with transaction ID: ${newTransaction.transactionID} by ${newTransaction.gateway_name} and will be processed within 15 minutes.`,
            'deposit_request',
            { amount: newTransaction.amount, transactionID: newTransaction.transactionID }
        );

        return res.status(200).json({
            success: true,
            message: 'Transaction submitted successfully',
            transaction: newTransaction,
            bonusApplied: !!depositBonus,
            bonusAmount
        });

    } catch (error) {
        console.error("Transaction Submission Error:", error);
        return res.status(500).json({ error: error.message });
    }
}


















////////////////////////////////////////////////////////////////// user trnx /////////////////

///////////////////////////////////////////////////////////////

// router.put("/deposit/approve/:transactionID", 
// exports.approveDepositbySubAdmin = async (req, res) => {
//     try {
//         const { userId, referralCode, status } = req.body;
//         const transactionID = req.params.transactionID;
//         console.log(userId, referralCode, status, transactionID);
//         // Find the user
//         // console.log(referralCode);
//         const user = await User.findOne({ userId, referredBy: referralCode });
//         // console.log(user);
//         // console.log(user[0].referredBy);
//         console.log(user.referredBy !== referralCode);
//         if (user.referredBy !== referralCode) return res.status(404).json({ message: 'User not found' });
//         // console.log("ad",referralCode);
//         // Find the sub-admin
//         const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
//         console.log("sub", subAdmin.referralCode);
//         if (!subAdmin.referralCode === referralCode) {
//             return res.status(400).json({ message: 'Invalid Match' });
//         }
//         // Find the transaction
//         const transaction = await TransactionModel.findOne({ userId, transactionID, referredBy: subAdmin.referralCode, type: 0 });

//         console.log("transaction  --- 1 ", transaction);
//         // Ensure transaction is not already processed
//         if (transaction.referredBy !== subAdmin.referralCode && transaction.referredBy === user.referredBy) {
//             console.log("transaction  --- 1 ", transaction.referredBy !== subAdmin.referralCode && transaction.referredBy === user.referredBy);
//             console.log("transaction  --- 1 ", transaction.referredBy, subAdmin.referralCode, user.referredBy);
//             return res.status(400).json({ message: "Transaction already processed" });
//         }

//         console.log("transaction  --- 2 ",req.body.status);

//         if (transaction.referredBy !== subAdmin.referralCode && transaction.userId !== user.userId && transaction.transactionID !== transactionID && transaction.referredBy !== user.referredBy) {
//             res.status(400).json({ message: "Transaction not found" });
//         }

//         console.log(subAdmin.balance >= transaction.amount && transaction.referredBy === subAdmin.referralCode && transaction.userId === user.userId && transaction.transactionID === transactionID && transaction.referredBy === user.referredBy);
//         if (subAdmin.balance >= transaction.amount && transaction.referredBy === subAdmin.referralCode && transaction.userId === user.userId && transaction.transactionID === transactionID && transaction.referredBy === user.referredBy) {


// console.log("transaction  --- 2 ",req.body.status);

//             if (parseInt(req.body.status) === parseInt(1)) {


//                 subAdmin.balance -= transaction.amount;
//                 // const bonusAmount = Math.floor((transaction.amount * 4) / 100); // use Math.floor to convert to integer
//                 // const totalAmount = baseAmountInt + bonus;


//                 user.balance += transaction.amount;


//                 // const totalAmount = transaction.amount + bonusAmount;
//                 // subAdmin.balance -= transaction.amount;
//                 // if (user.bonus) {
//                 //     user.bonus.bonusAmount += bonusAmount;
//                 //     user.bonus.isActive = true;
//                 //     user.bonus.appliedDate = new Date();
//                 // }

//                 transaction.updatetime = new Date();
//                 transaction.status = 1; // Mark as approved
//                 await user.save();
//                 await subAdmin.save();
//                 await transaction.save();
//                 res.status(200).json({ message: "Deposit processed successfully", user });
//             } else if (parseInt(req.body.status) === parseInt(2)) {


//                 transaction.updatetime = new Date();
//                 transaction.status = parseInt(2)// Mark as approved
//                 await transaction.save();


//                 let Admin_Balance = SubAdmin.balance
//                 res.status(200).json({ message: "Deposit processed successfully" });
//             }
//         }





//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Admin balance not enough" });
//     }
// };

exports.approveDepositbySubAdmin = async (req, res) => {
    console.log("console body", req.body);
    try {
        const { userId, referralCode, status } = req.body;
        const transactionID = req.params.transactionID;
        console.log("Find the", userId, referralCode, status, transactionID);
        // Find the user
        const user = await User.findOne({ userId, referredBy: referralCode });
        console.log("user", userId);
        if (!user || user.referredBy !== referralCode) {
            return res.status(404).json({ message: 'User not found or referral mismatch' });
        }

        // Find the sub-admin
        const subAdmin = await SubAdmin.findOne({ referralCode });
        console.log("sub", subAdmin.referralCode);
        if (!subAdmin || subAdmin.referralCode !== referralCode) {
            return res.status(400).json({ message: 'Invalid SubAdmin referral code' });
        }

        // Find the transaction
        const transaction = await TransactionModel.findOne({
            userId,
            transactionID,
            referredBy: referralCode,
            type: 0,
        });
        console.log("transactionID", transactionID);
        console.log("transaction  --- 2 ", req.body.status);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        console.log("transaction  --- 2 ", req.body.status);

        // Check if already approved
        if (transaction.status !== 0) {
            return res.status(400).json({ message: "Transaction already approved" });
        }


        console.log("transaction  --- 3 ", transaction.status);
        console.log("transaction  --- 3 ", transaction.amount);

        // Process based on status
        if (parseInt(status) === 1) {
            // Check SubAdmin balance
            if (subAdmin.balance < transaction.amount) {
                return res.status(400).json({ message: "SubAdmin balance is not enough" });
            }
            // Update balances
            subAdmin.balance -= transaction.amount;
            user.balance += transaction.amount;

            // Update transaction status
            transaction.status = 1;
            transaction.updatetime = new Date();
            transaction.bonusStatus = 'active';
            // If bonus was applied, create UserBonus record
            // if (transaction.isBonusApplied === true ) {
            // bonusAmount = (depositBonus.percentage / 100) * baseAmount;
            // turnoverRequirement = bonusAmount * depositBonus.wageringRequirement;
            user.bonus = {
                active: true,
                bonusAmount: transaction.bonus_amount,
                wageringRequirement: transaction.turnoverRequirement,
                completedTurnover: 0
            };

            // }


            console.log("transaction  --- 4 ", transaction.base_amount, transaction.bonus_amount, transaction.turnoverRequirement);

            // Save all changes

            console.log("transaction  --- 5 ", transaction.isBonusApplied);
            if (transaction.isBonusApplied) {
                const bonus = await Bonus.findOne({ bonusType: 'deposit', _id: transaction.bonusId, isActive: true });

                console.log("bonus", bonus);
                if (bonus) {
                    await UserBonus.create({
                        userId: user.userId,
                        bonusId: transaction.bonusId,
                        amount: transaction.amount,
                        bonusAmount: transaction.bonus_amount,
                        remainingAmount: transaction.bonus_amount,
                        turnoverRequirement: transaction.turnoverRequirement,
                        expiryDate: transaction.expiryDate,
                        transactionId: transaction.transactionID
                    });
                    console.log("UserBonus created", user.userId, transaction.bonusId, transaction.amount, transaction.bonus_amount, transaction.turnoverRequirement, transaction.transactionID);

                }

            }
            await subAdmin.save();
            await user.save();
            await transaction.save();
            await notificationController.createNotification(
                `Deposit approved for ${transaction.transactionID} with (User ID: ${user.userId})`,
                user.userId,
                `deposit of ${transaction.amount} has been processed at ${new Date()}  by ${transaction.gateway_name}.Your deposit of ${transaction.amount} has been approved at ${new Date()} with transaction ID: ${transaction.transactionID} by ${transaction.gateway_name} and will be processed at ${new Date()}.`,
                'deposit_approved',
                { amount: transaction.amount, transactionID: transaction.transactionID }
            );

            return res.status(200).json({ message: "Deposit approved successfully", transaction });



        } else if (parseInt(status) === 2) {
            console.log(transaction);
            transaction.updatetime = new Date();
            transaction.status = 2;

            await transaction.save();
            await notificationController.createNotification(
                `Deposit rejected for ${transaction.transactionID} with (User ID: ${user.userId})`,
                user.userId,
                `deposit of ${transaction.amount} has been rejected at ${new Date()}  by ${transaction.gateway_name}.
            Your deposit of ${transaction.amount} has been rejected at ${new Date()} with transaction ID: ${transaction.transactionID} by ${transaction.gateway_name} and will be processed.`,
                'deposit_rejected',
                { amount: transaction.amount, transactionID: transaction.transactionID }
            );




            return res.status(200).json({ message: "Deposit rejected successfully", transaction });
        } else {
            return res.status(400).json({ message: "Invalid status value" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



exports.Approve_Transfar_With_Deposit_And_Widthraw_By_SubAdmin = async (req, res) => {
    try {
        const { userId, referralCode, email, mobile, amount, type } = req.body;

        const transactionType = parseInt(type);
        const baseAmountInt = parseInt(amount);

        if (!userId || !referralCode || !email || !mobile || isNaN(baseAmountInt) || isNaN(transactionType)) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const user = await User.findOne({ userId, referredBy: referralCode });
        if (!user) {
            return res.status(404).json({ message: 'User not found or referral code mismatch' });
        }

        if (!user.phone || String(user.phone[0].number) !== String(mobile)) {
            return res.status(400).json({ message: 'User phone number mismatch' });
        }

        const subAdmin = await SubAdmin.findOne({ email });
        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        if (subAdmin.referralCode !== referralCode) {
            return res.status(400).json({ message: 'Referral code mismatch with sub-admin' });
        }

        if (baseAmountInt <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        const transactionID = generateReferralCode();

        const isValidTransaction =
            user.referredBy === subAdmin.referralCode &&
            user.userId === userId &&
            baseAmountInt > 0;

        // ✅ Withdrawal
        if (isValidTransaction && transactionType === 1) {
            if (user.balance < baseAmountInt) {
                return res.status(400).json({ message: 'User does not have sufficient balance for withdrawal' });
            }

            const newTransaction = new Transaction({
                userId: user.userId,
                transactionID,
                base_amount: baseAmountInt,
                amount: baseAmountInt,
                gateway_name: "transfer",
                payment_type: "transfer",
                mobile,
                type: 1,
                status: 1,
                referredBy: referralCode,
                is_commission: false,
                referredbysubAdmin: subAdmin._id
            });

            user.balance -= baseAmountInt;
            subAdmin.balance += baseAmountInt;

            await newTransaction.save();
            await user.save();
            await subAdmin.save();

            return res.status(200).json({
                message: "Withdrawal transaction completed successfully",
                userBalance: user.balance,
                subAdminBalance: subAdmin.balance
            });
        }

        // ✅ Deposit
        else if (isValidTransaction && transactionType === 0) {
            if (subAdmin.balance < baseAmountInt) {
                return res.status(400).json({ message: 'Sub-admin does not have sufficient balance for deposit' });
            }

            const bonus = Math.floor((baseAmountInt * 4) / 100); // 4% bonus
            const totalAmount = baseAmountInt + bonus;

            const newTransaction = new Transaction({
                userId: user.userId,
                transactionID,
                base_amount: baseAmountInt,
                bonus_amount: bonus,
                amount: totalAmount,
                gateway_name: "transfer",
                payment_type: "transfer",
                mobile,
                type: 0,
                status: 1,
                referredBy: referralCode,
                is_commission: false,
                referredbysubAdmin: subAdmin._id
            });

            user.balance += baseAmountInt;
            subAdmin.balance -= baseAmountInt;

            await newTransaction.save();
            await user.save();
            await subAdmin.save();

            return res.status(200).json({
                message: "Deposit transaction completed successfully with bonus",
                userBalance: user.balance,
                subAdminBalance: subAdmin.balance
            });
        }

        return res.status(400).json({ message: 'Invalid transaction type or conditions not met' });

    } catch (error) {
        console.error('Transaction Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};






//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.checkWithdrawalEligibility = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find active bonuses for user
        const userBonuses = await UserBonus.find({
            userId,
            status: { $in: ['active', 'pending'] }, // Include pending bonuses
            expiryDate: { $gt: new Date() }
        }).populate('bonusId');

        // If no active bonuses, user is eligible by default
        if (!userBonuses.length) {
            return res.status(200).json({
                message: 'No active bonuses found. User is eligible for withdrawal.',
                eligible: true,
                bonuses: []
            });
        }

        const results = [];
        let isFullyEligible = true;

        // Check each bonus's turnover requirement
        for (const bonus of userBonuses) {
            const { createdAt, expiryDate, bonusId, turnoverRequirement } = bonus;
            const eligibleGames = bonusId?.eligibleGames || [];

            // Build query for betting history
            const matchQuery = {
                member: userId,
                start_time: { $gte: createdAt },
                end_time: { $lte: expiryDate },
                status: 1 // Only count settled bets (assuming 1 means settled)
            };

            // Filter by eligible games if specified
            if (eligibleGames.length && eligibleGames[0] !== 'all') {
                matchQuery.game_id = { $in: eligibleGames };
            }

            // Calculate completed turnover
            const turnoverData = await BettingHistory.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalTurnover: { $sum: '$turnover' },
                        totalBets: { $sum: 1 } // Additional metric
                    }
                }
            ]);

            const completedTurnover = turnoverData[0]?.totalTurnover || 0;
            const isCompleted = completedTurnover >= turnoverRequirement;

            // Update the bonus status in database if completed
            if (isCompleted && bonus.status !== 'completed') {
                await UserBonus.findByIdAndUpdate(bonus._id, {
                    status: 'completed',
                    completedTurnover,
                    updatedAt: new Date()
                });
            }

            // If any bonus requirement isn't met, user isn't fully eligible
            if (!isCompleted) {
                isFullyEligible = false;
            }

            results.push({
                bonusId: bonus._id,
                bonusName: bonusId?.name || 'Unknown Bonus',
                bonusType: bonusId?.bonusType || 'unknown',
                requiredTurnover: turnoverRequirement,
                completedTurnover,
                remainingTurnover: Math.max(0, turnoverRequirement - completedTurnover),
                status: isCompleted ? 'completed' : 'incomplete',
                expiryDate: expiryDate.toISOString(),
                createdAt: bonus.createdAt.toISOString(),
                eligibleGames: eligibleGames,
                wageringRequirement: bonusId?.wageringRequirement || 1
            });
        }

        return res.status(200).json({
            message: isFullyEligible
                ? 'All bonus requirements met'
                : 'Some bonus requirements not met',
            eligible: isFullyEligible,
            bonuses: results,
            summary: {
                totalBonuses: results.length,
                completedBonuses: results.filter(b => b.status === 'completed').length,
                pendingBonuses: results.filter(b => b.status === 'incomplete').length,
                totalRequiredTurnover: results.reduce((sum, b) => sum + b.requiredTurnover, 0),
                totalCompletedTurnover: results.reduce((sum, b) => sum + b.completedTurnover, 0),
                totalRemainingTurnover: results.reduce((sum, b) => sum + b.remainingTurnover, 0)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('checkWithdrawalEligibility error:', error);

        // Differentiate between server errors and database errors
        const statusCode = error.name === 'MongoError' ? 503 : 500;

        return res.status(statusCode).json({
            message: 'Error checking withdrawal eligibility',
            error: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
            eligible: false, // Assume not eligible in case of error
            systemStatus: 'error',
            timestamp: new Date().toISOString()
        });
    }
};
















exports.checkWithdrawalEligibilityActive = async (req, res) => {
    try {
        const { userId } = req.body;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const matchQuery = {
            status: { $in: ['active'] },
            updatedAt: { $gte: sevenDaysAgo },
        };

        if (userId) {
            matchQuery.userId = userId;
        }
        console.log("matchQuery", matchQuery);
        const completedBonuses = await UserBonus.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'bonus',
                    localField: 'bonusId',
                    foreignField: '_id',
                    as: 'bonusInfo'
                }
            },
            { $unwind: '$bonusInfo' },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    bonusId: 1,
                    amount: 1,
                    remainingAmount: 1,
                    turnoverRequirement: 1,
                    completedTurnover: 1,
                    status: 1,
                    expiryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    transactionId: 1,
                    'bonusInfo.name': 1,
                    'bonusInfo.bonusType': 1,
                    'bonusInfo.percentage': 1,
                    'bonusInfo.fixedAmount': 1,
                    'bonusInfo.validDays': 1,
                    'bonusInfo.eligibleGames': 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        console.log("completedBonuses", completedBonuses)
        res.status(200).json({ success: true, data: completedBonuses });
    } catch (error) {
        console.error('Error fetching completed user bonuses:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};






exports.checkWithdrawalEligibilityComplated = async (req, res) => {
    try {
        const { userId } = req.body;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const matchQuery = {
            status: { $in: ['completed', 'expired', 'cancelled', 'pending'] },
            updatedAt: { $gte: sevenDaysAgo }
        };

        if (userId) {
            matchQuery.userId = userId;
        }

        const completedBonuses = await UserBonus.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'bonus',
                    localField: 'bonusId',
                    foreignField: '_id',
                    as: 'bonusInfo'
                }
            },
            { $unwind: '$bonusInfo' },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    bonusId: 1,
                    amount: 1,
                    remainingAmount: 1,
                    turnoverRequirement: 1,
                    completedTurnover: 1,
                    status: 1,
                    expiryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    transactionId: 1,
                    'bonusInfo.name': 1,
                    'bonusInfo.bonusType': 1,
                    'bonusInfo.percentage': 1,
                    'bonusInfo.fixedAmount': 1,
                    'bonusInfo.validDays': 1,
                    'bonusInfo.eligibleGames': 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        console.log("completedBonuses", completedBonuses)
        res.status(200).json({ success: true, data: completedBonuses });
    } catch (error) {
        console.error('Error fetching completed user bonuses:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





exports.WithdrawTransaction = async (req, res) => {
    const { userId, amount, gateway_name, mobile, referredBy } = req.body;
    console.log(req.body);

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("User Balance Before Withdrawal:", user.balance);

        // Check if the user has enough balance
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        if (user.balance > 0 && user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Validate referral code (if provided)
        if (referredBy) {
            const referredUser = await User.findOne({ referredBy });

            if (!referredUser) {
                return res.status(404).json({ message: 'Invalid referral code' });
            }
        }

        // checkTurnoverRequirements(user.userId);

        const transactionID = generateReferralCode();
        const newTransaction = new Transaction({
            userId: user.userId,
            transactionID,
            base_amount: amount,
            amount: amount,
            gateway_name: gateway_name,
            mobile: mobile,
            type: 1,  // Withdrawal type
            status: 0,  // 0 = pending
            referredBy: referredBy || null,
            // is_commission: false,
        });

        // Deduct balance
        user.balance -= parseInt(amount);

        // Save transaction and user balance update
        await newTransaction.save();
        await user.save();

        console.log("New Transaction:", newTransaction);
        console.log("Updated User:", user);

        await notificationController.createNotification(
            `Withdrawal request send ${newTransaction.transactionID} with (User ID: ${user.userId})`,
            newTransaction.userId,
            `Withdrawal of ${newTransaction.amount} has been submitted at ${new Date()}  by ${newTransaction.gateway_name}.Your withdrawal request of ${newTransaction.amount} has been send at ${new Date()} with transaction ID: ${newTransaction.transactionID} by ${newTransaction.gateway_name} and will be processed within 15 minutes.`,
            'withdrawal_request',
            { amount: newTransaction.amount, transactionID: newTransaction.transactionID }
        );

        res.json({
            message: "Withdrawal request submitted successfully",
            transactionID,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};





// exports.approveDepositbySubAdmin = async (req, res) => {

//     try {
//         const { userId, referralCode, status } = req.body;
//         const transactionID = req.params.transactionID;
//         console.log(userId, referralCode, status, transactionID);

//         // Find the user
//         const user = await User.findOne({ userId, referredBy: referralCode });
//         if (!user || user.referredBy !== referralCode) return res.status(404).json({ message: 'User not found' });

//         const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
//         if (!subAdmin || subAdmin.referralCode !== referralCode) {
//             return res.status(400).json({ message: 'Invalid Match' });
//         }

//         // Find the transaction
//         const transaction = await Transaction.findOne({ userId, transactionID, referredBy: subAdmin.referralCode });
//         if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

//         // Ensure transaction is not already processed
//         if (transaction.status !== 0) {
//             return res.status(400).json({ message: "Transaction already processed" });
//         }

//         // Process deposit approval
//         if (subAdmin.balance >= transaction.amount && transaction.referredBy === subAdmin.referralCode && transaction.userId === user.userId && transaction.transactionID === transactionID && transaction.referredBy === user.referredBy && parseInt(status) === 1) {
// console.log("user.amount", user.balance);
//             subAdmin.balance -= transaction.amount;
//             await subAdmin.save();

//             const bonusAmount = (transaction.amount * 30) / 100;
//             user.balance += transaction.amount + bonusAmount;

//             if (user.bonus) {
//                 user.bonus.bonusAmount += bonusAmount;
//                 user.bonus.isActive = true;
//                 user.bonus.appliedDate = new Date();
//             }

//             transaction.updatetime = new Date();
//             transaction.status = 1; // Mark as approved
//             await user.save();
//             await transaction.save();

//             return res.status(200).json({ message: "Deposit processed successfully", user, transaction });





//         } else {

//             transaction.status = 2; // Mark as rejected
//             transaction.updatetime = new Date();
//             await transaction.save();

//             return res.status(200).json({ message: "Deposit rejected", user });
//         }

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
////////////////////////////////////////////////Payment method//////////////////////////////////////













































////////////////////////////////////////////
exports.approveWidthdrawBySubAdmin = async (req, res) => {
    try {
        const { userId, referralCode, status } = req.body;
        const transactionID = req.params.transactionID;

        // Find the user
        const user = await User.findOne({ userId, referredBy: referralCode });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the sub-admin
        const subAdmin = await SubAdmin.findOne({ referralCode });
        if (!subAdmin) return res.status(400).json({ message: 'Sub-admin not found' });

        // Find the withdrawal transaction
        const transaction = await TransactionModel.findOne({
            userId,
            transactionID,
            referredBy: referralCode,
            type: 1, // withdrawal
        });

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Ensure transaction is pending (not already processed)
        if (transaction.status !== 0) {
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        // Match verification (redundant now, but keeping just in case)
        if (
            transaction.referredBy !== referralCode ||
            transaction.userId !== userId ||
            transaction.transactionID !== transactionID
        ) {
            return res.status(400).json({ message: "Invalid transaction data" });
        }

        // Process based on status
        if (parseInt(status) === 1) {
            // Approve the withdrawal
            subAdmin.balance += transaction.base_amount;

            transaction.status = 1; // Approved
            transaction.updatetime = new Date();

            await subAdmin.save();
            await transaction.save();

            await notificationController.createNotification(
                `Withdrawal approved by admin with (User ID: ${user.userId})`,
                transaction.userId,
                `Your withdrawal of ${transaction.base_amount} has been approved at ${new Date()}.`,
                'withdrawal_accepted',
                { amount: transaction.base_amount }
            );

            return res.status(200).json({
                message: "Withdrawal approved successfully",
                subAdminBalance: subAdmin.balance
            });
        } else {
            // Reject the withdrawal
            user.balance += transaction.base_amount;

            transaction.status = 2; // Rejected
            transaction.updatetime = new Date();

            await user.save();
            await transaction.save();

            await notificationController.createNotification(
                `Withdrawal rejected by admin with (User ID: ${user.userId})`,
                transaction.userId,
                `Your withdrawal of ${transaction.base_amount} has been rejected at ${new Date()}.withdrawal _rejected by admin , please try again`,
                'withdrawal_rejected',
                { amount: transaction.base_amount }
            );

            return res.status(200).json({ message: "Withdrawal rejected successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// exports.AddPaymentMethodNumberDeposit = async ({
//     user_role,
//     email,
//     referralCode,

// }) => {
//     const defaultGateways = [
//         {
//             gateway_name: "Bkash",
//             image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Nagad",
//             image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Rocket",
//             image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Upay",
//             image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },

//     ];

//     try {
//         const user = await SubAdmin.findOne({ user_role, email, referralCode });
//         if (!user) {
//             return { success: false, message: "User not found" };
//         }

//         // Remove oldest custom method if limit is reached
//         const userCustomMethods = await PaymentGateWayTable.find({
//             email,
//             referredBy: referralCode,
//             isDefault: false
//         }).sort({ updatetime: 1 });

//         if (userCustomMethods.length >= 4) {
//             const oldest = userCustomMethods[0];
//             if (oldest) {
//                 await PaymentGateWayTable.deleteOne({ _id: oldest._id });
//             }
//         }

//         // Create new gateways if not already present
//         for (const gateway of defaultGateways) {
//             const exists = await PaymentGateWayTable.findOne({
//                 gateway_name: gateway.gateway_name,
//                 referredBy: referralCode,
//                 email,
//                 user_role
//             });

//             if (!exists) {
//                 await PaymentGateWayTable.create({
//                     user_role: user.user_role,
//                     email:user.email,
//                     gateway_name: gateway.gateway_name,
//                     gateway_Number: gateway.gateway_Number || null,
//                     payment_type: gateway.payment_type || null,
//                     image_url: gateway.image_url,
//                     referredBy: user.referralCode,
//                     start_time: gateway.start_time || null,
//                     end_time: gateway.end_time || null,
//                     minimum_amount: gateway.minimum_amount || 0,
//                     maximum_amount: gateway.maximum_amount || 0,
//                     is_active: true,
//                     timestamp: new Date(),
//                     updatetime: new Date()
//                 });
//             }
//         }

//         return {
//             success: true,
//             message: "Payment method added successfully"
//         };

//     } catch (error) {
//         console.error("AddPaymentMethodNumberWithdrawal Error:", error);
//         return {
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         };
//     }
// };






// exports.AddPaymentMethodNumberWithdrawal = async ({
//     user_role,
//     email,
//     referralCode,

// }) => {
//      const defaultGateways = [
//         {
//             gateway_name: "Bkash",
//             image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Nagad",
//             image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Rocket",
//             image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },
//         {
//             gateway_name: "Upay",
//             image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
//             is_active: true,
//             payment_type: "Cashout"
//         },

//     ];

//     try {
//         const user = await SubAdmin.findOne({ user_role, email, referralCode });
//         if (!user) {
//             return { success: false, message: "User not found" };
//         }

//         // Remove oldest custom method if limit is reached
//         const userCustomMethods = await WidthralPaymentGateWayTable.find({
//             email,
//             referredBy: referralCode,
//             isDefault: false
//         }).sort({ updatetime: 1 });

//         if (userCustomMethods.length >= 4) {
//             const oldest = userCustomMethods[0];
//             if (oldest) {
//                 await WidthralPaymentGateWayTable.deleteOne({ _id: oldest._id });
//             }
//         }

//         // Create new gateways if not already present
//         for (const gateway of defaultGateways) {
//             const exists = await WidthralPaymentGateWayTable.findOne({
//                 gateway_name: gateway.gateway_name,
//                 referredBy: referralCode,
//                 email,
//                 user_role
//             });

//             if (!exists) {
//                 await WidthralPaymentGateWayTable.create({
//                     user_role: user.user_role,
//                     email:user.email,
//                     gateway_name: gateway.gateway_name,
//                     gateway_Number: gateway.gateway_Number || null,
//                     payment_type: gateway.payment_type || null,
//                     image_url: gateway.image_url,
//                     referredBy: user.referralCode,
//                     start_time: gateway.start_time || null,
//                     end_time: gateway.end_time || null,
//                     minimum_amount: gateway.minimum_amount || 0,
//                     maximum_amount: gateway.maximum_amount || 0,
//                     is_active: true,
//                     timestamp: new Date(),
//                     updatetime: new Date()
//                 });
//             }
//         }

//         return {
//             success: true,
//             message: "Payment method added successfully"
//         };

//     } catch (error) {
//         console.error("AddPaymentMethodNumberWithdrawal Error:", error);
//         return {
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         };
//     }
// };




// exports.subAdminGetWayList = async (req, res) => {
//     console.log(req.body);
//     try {
//         const { referralCode } = req.body;

//     // Tier 1
//     // const tier1Users = await User.find({ referredBy: referralCode });
//     // const tier1Emails = tier1Users.map(u => u.email);

//     // // Tier 2
//     // const tier2Users = await User.find({ referredBy: { $in: tier1Users.map(u => u.myReferralCode) } });
//     // const tier2Emails = tier2Users.map(u => u.email);

//     // // Tier 3
//     // const tier3Users = await User.find({ referredBy: { $in: tier2Users.map(u => u.myReferralCode) } });
//     // const tier3Emails = tier3Users.map(u => u.email);

//     // const allEmails = [...tier1Emails, ...tier2Emails, ...tier3Emails];

//     const gateways = await PaymentGateWayTable.find({ email: { $in: allEmails } });
//     const gatewayCount = await PaymentGateWayTable.countDocuments({ email: { $in: allEmails } });

//     res.status(200).json({ gatewayCount, gateways });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// ------------------deposit payment method list----------------------------


exports.subAdminGetWayList = async (req, res) => {
    console.log(req.body);
    try {
        const { referralCode, email } = req.body;

        // Querying the database using email and referralCode
        const gateways = await PaymentGateWayTable.find({ email: email, referredBy: referralCode });
        const gatewayCount = await PaymentGateWayTable.countDocuments({ email: email, referredBy: referralCode });

        console.log(gateways);
        // console.log(gatewayCount);

        res.status(200).json({ gateways, gatewayCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------widthraw payment method list----------------------------

exports.subAdminGetWayListWidthraw = async (req, res) => {
    console.log(req.body);
    try {
        const { referralCode, email } = req.body;

        // Querying the database using email and referralCode
        const gateways = await WidthralPaymentGateWayTable.find({ email: email, referredBy: referralCode });
        const gatewayCount = await WidthralPaymentGateWayTable.countDocuments({ email: email, referredBy: referralCode });

        console.log(gateways);
        // console.log(gatewayCount);

        res.status(200).json({ gateways, gatewayCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};






// --------------------------------------------------user payment method deposit list---------------------------------------------


exports.GetPaymentMethodsUser = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("User ID:", userId);

        // Validate User
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);

        // Get current time
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        // Use aggregation to filter active payment methods within time range
        const paymentMethods = await PaymentGateWayTable.aggregate([
            {
                $match: {
                    is_active: true,
                    referredBy: user.referredBy
                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $lte: ["$startTotalMinutes", "$currentTotalMinutes"] },
                            { $gte: ["$endTotalMinutes", "$currentTotalMinutes"] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    gateway_name: 1,
                    gateway_Number: 1,
                    payment_type: 1,
                    image_url: 1,
                    start_time: 1,
                    end_time: 1,
                    is_active: 1,
                    minimun_amount: 1,
                    maximum_amount: 1,
                }
            }
        ]);

        console.log("Available Payment Methods:", paymentMethods);

        return res.status(200).json({ paymentMethods });
    } catch (error) {
        console.error("Error retrieving payment methods:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



// --------------------------------------------------user payment method withdraw list---------------------------------------------




exports.GetPaymentMethodsWidthrawUser = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("User ID:", userId);

        // Validate User
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);

        // Get current time
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        // Use aggregation to filter active payment methods within time range
        const paymentMethods = await WidthralPaymentGateWayTable.aggregate([
            {
                $match: {
                    is_active: true,
                    referredBy: user.referredBy
                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $lte: ["$startTotalMinutes", "$currentTotalMinutes"] },
                            { $gte: ["$endTotalMinutes", "$currentTotalMinutes"] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    gateway_name: 1,
                    gateway_Number: 1,
                    payment_type: 1,
                    image_url: 1,
                    start_time: 1,
                    end_time: 1,
                    is_active: 1,
                    minimun_amount: 1,
                    maximum_amount: 1,
                }
            }
        ]);

        console.log("Available Payment Methods:", paymentMethods);

        return res.status(200).json({ paymentMethods });
    } catch (error) {
        console.error("Error retrieving payment methods:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};






// ---------------------------------------------------- user payment method deposit status update---------------------------


exports.updateDepositGatewayStatus = async (req, res) => {
    try {
        const { gateway_name, is_active, referralCode, email } = req.body;

        console.log("Updating:", gateway_name, is_active, referralCode);
        const newSubAdmin = await SubAdmin.findOne({ referralCode });
        const updated = await PaymentGateWayTable.findOneAndUpdate(
            { gateway_name: gateway_name, referredBy: newSubAdmin.referralCode },
            { is_active },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Gateway not found" });
        }

        console.log("Updated Gateway:", updated);

        res.json({ success: true, updated, message: "Gateway status updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// ---------------------------------------------------- user payment method withdraw edit update---------------------------

exports.updatedepositGatewayType = async (req, res) => {
    try {
        console.log(req.body);
        const { gateway_name, payment_type, gateway_number, is_active, referralCode, email } = req.body.formData;
        console.log(":", payment_type, gateway_number, is_active, referralCode, email);

        const newSubAdmin = await SubAdmin.findOne({ referralCode, email });
        const updated = await PaymentGateWayTable.findOneAndUpdate(
            { gateway_name, referredBy: newSubAdmin.referralCode, email: newSubAdmin.email },
            {
                payment_type,
                gateway_Number: gateway_number, // Ensure this matches your schema's field name
                is_active,
            },
            { new: true }
        );

        console.log("Updated my new Gateway:", updated);


        if (!updated) {
            return res.status(404).json({ success: false, message: "Gateway not found" });
        }

        res.json({ success: true, updated, message: "Gateway updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// ---------------------------------------------------- user payment method withdraw status update---------------------------


exports.updateWidthrawGatewayStatus = async (req, res) => {
    try {
        const { gateway_name, is_active, referralCode, email } = req.body;

        console.log("Updating:", gateway_name, is_active, referralCode);
        const newSubAdmin = await SubAdmin.findOne({ referralCode, email });
        const updated = await WidthralPaymentGateWayTable.findOneAndUpdate(
            { gateway_name, referredBy: newSubAdmin.referralCode, email: newSubAdmin.email },
            { is_active },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Gateway not found" });
        }

        console.log("Updated Gateway:", updated);

        res.json({ success: true, updated, message: "Gateway status updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




// ---------------------------------------------------- user payment method withdraw edit update---------------------------

exports.updateWithdrawalGatewayType = async (req, res) => {
    console.log(req.body);
    try {
        const { gateway_name, payment_type, gateway_number, is_active, referralCode } = req.body.formData;
        console.log(gateway_name, payment_type, gateway_number, is_active, referralCode);
        const newSubAdmin = await SubAdmin.findOne({ referralCode });

        const updated = await WidthralPaymentGateWayTable.findOneAndUpdate(
            { gateway_name: gateway_name, referredBy: newSubAdmin.referralCode, email: newSubAdmin.email },
            {
                payment_type,
                gateway_Number: gateway_number,
                is_active,
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Gateway not found" });
        }

        res.json({ success: true, updated, message: "Gateway updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




////////////////////////////////////////////////Payment method//////////////////////////////////////

//////////////////////////////////withdrawWIth///////////////////////////////

// exports.withdrawWIth = async (req, res) => {
//     const { userId, amount,  referredCode } = req.body;

//     try {
//         const { userId, referralCode,status } = req.body;
//         const transactionID = req.params.transactionID;
// console.log(userId, referralCode.length,status ,transactionID);
//         // Find the user
//         const user = await User.findOne({ userId });
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         console.log(user);
//         // Find the transaction
//         const transaction = await TransactionModel.findOne({ userId, transactionID });
//         if (!transaction) return res.status(404).json({ message: "Transaction not found" });
// console.log(transaction);
//         // Ensure transaction is not already processed
//         if (transaction.status !== 0) {
//             return res.status(400).json({ message: "Transaction already processed" });
//         }

//         // Process deposit approval
//         const bonusAmount = (transaction.amount * 0.35) / 100;

//         if (req.body.status === 1) { // Approve transaction
//             user.balance += transaction.amount + bonusAmount;
//             user.bonus.bonusAmount += bonusAmount;

//             // Referral bonus handling
//             if (referralCode) {
//                 const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
//                 if (!subAdmin) {
//                     return res.status(400).json({ message: 'Invalid referralCode' });
//                 }

//                 subAdmin.balance > transaction.amount ? subAdmin.balance -= (transaction.amount) : subAdmin.balance
//                 // subAdmin.bonus += bonusAmount;
//                 subAdmin.balance > transaction.amount && await subAdmin.save();

//             }
//             transaction.updatetime = new Date();
//             transaction.status = 1; // Mark as approved

//         } else if (req.body.status === 2) { // Reject transaction
//             transaction.status = 2; // Mark as rejected
//         } else {
//             return res.status(400).json({ message: "Invalid transaction status" });
//         }

//         await user.save();
//         await transaction.save();
// console.log(user);
// console.log(transaction);
//         res.status(200).json({ message: "Deposit processed successfully", user });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }




///////////////////////////////////////////





///////////////////////////////// search Transaction widthraw request //////////////////////////////////////////


exports.searchWidthdrawTransactions = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy: SubAdminuser.referralCode, type: 1, status: parseInt(0) });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: parseInt(1), status: parseInt(0) }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: referredBy, type: parseInt(1), status: parseInt(0) } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        // console.log("totalDeposit",totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.searchWidthdrawTransactionsReportAprove = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy: SubAdminuser.referralCode, type: 1, });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: 1, status: 1 }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: SubAdminuser.referralCode, type: 1, status: 1 } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        // console.log("totalDeposit",totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.searchWidthdrawTransactionsReportReject = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy: SubAdminuser.referralCode, type: 1, });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: 1, status: 2 }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: SubAdminuser.referralCode, type: 1, status: 2 } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$base_amount" } } }
        ]);
        console.log("totalDeposit", totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};






















///////////////////////////////// search Transaction widthraw request //////////////////////////////////////////

/////////////////////////////////////////////////////// search Transaction deposit request////////////////////////////////


exports.Search_Deposit_Transactions_Pending = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        // console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy, type: 0 });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        // console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        // console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: parseInt(0), status: parseInt(0) }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: SubAdminuser.referralCode, type: 0, status: 0 } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        // console.log("totalDeposit",totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};





exports.searchDepositTransactionsReportAprove = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy, type: 0 });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: 0, status: parseInt(1) }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: SubAdminuser.referralCode, type: 0, status: parseInt(1) } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$base_amount" } } }
        ]);
        // console.log("totalDeposit",totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};



exports.searchDepositTransactionsReportreject = async (req, res) => {
    try {
        const { userId, amount, gateway_name, status, referredBy, startDate, endDate } = req.body;
        console.log(userId, amount, gateway_name, status, referredBy, startDate, endDate);
        // console.log(req.body);



        const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy })
        if (!SubAdminuser) return res.status(404).json({ message: 'User not found' });
        console.log(SubAdminuser);
        // Find the transaction
        // const user = await User.findOne({ referredBy: SubAdminuser.referralCode });
        // if (!user) return res.status(404).json({ message: 'User not found' });
        // console.log(user);

        const transactionExists = await TransactionModel.findOne({ referredBy, type: 0 });
        if (!transactionExists) return res.status(404).json({ message: "Transaction not found" });
        console.log(transactionExists);


        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (amount) {
            query.base_amount = { $gte: parseFloat(amount) }; // Filters transactions where amount is greater than or equal
        }
        if (gateway_name) {
            query.gateway_name = gateway_name;
        }
        if (status !== undefined && !isNaN(status) && status !== "") {
            query.status = parseInt(status);
        }


        if (startDate && endDate) {
            query.datetime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.datetime = { $gte: new Date(startDate) };
        }
        console.log(query);
        const transactions = await Transaction.find({ ...query, referredBy: SubAdminuser.referralCode, type: 0, status: parseInt(2) }).sort({ datetime: -1 });

        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: SubAdminuser.referralCode, type: 0, status: parseInt(2) } }, // Filter deposits & accepted transactions
            { $match: { ...query } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$base_amount" } } }
        ]);
        // console.log("totalDeposit",totalDeposit[0].total)
        const total = totalDeposit[0]

        res.json({ transactions, total });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
};




exports.DepositsList = async (req, res) => {
    // console.log(req.body);
    try {
        const { referralCode, userId } = req.body;
        console.log(referralCode);

        // Find the user based on the referredCode
        const users = await User.find({ referredBy: referralCode });
        console.log(users);
        // If user not found, return 404
        if (!users) {
            return res.status(404).json({ message: 'User not found' });
        }
        const transactions = await Transaction.find({ referredBy: referralCode, status: 0 });

        const transactionscount = await Transaction.find({ referredBy: referralCode }).countDocuments();
        res.status(200).json({ transactionscount, transactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getTransactionDepositTotals = async (req, res) => {
    try {
        const { referralCode } = req.body;

        // Get date ranges
        const now = new Date();
        const lastDay = new Date();
        lastDay.setDate(now.getDate() - 1);

        const last7Days = new Date();
        last7Days.setDate(now.getDate() - 7);

        const last30Days = new Date();
        last30Days.setDate(now.getDate() - 30);



        // Aggregate query
        const results = await Transaction.aggregate([
            {
                $match: {
                    referredBy: referralCode,
                    type: 0, // Only deposits
                    status: 0, // Accepted transactions only
                    datetime: { $gte: last30Days }, // Only fetch last 30 days' data
                },
            },
            {
                $project: {
                    amount: 1,
                    period: {
                        $cond: {
                            if: { $gte: ["$datetime", lastDay] },
                            then: "lastDay",
                            else: {
                                $cond: {
                                    if: { $gte: ["$datetime", last7Days] },
                                    then: "last7Days",
                                    else: "last30Days"
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$period",
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);



        // Initialize summary
        let summary = {
            lastDay: 0,
            last7Days: 0,
            last30Days: 0
        };

        results.forEach(item => {
            summary[item._id] = item.totalAmount;
        });

        res.json({ success: true, data: summary });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

///////////////////////////////////////////////////////deposit////////////////////////////////



///////////////////////////////////////////////////////deposit user////////////////////////////////






exports.searchTransactionsbyUserId = async (req, res) => {
    try {
        const { filters = {}, userId } = req.body;
        const { type = [], status = [], date } = filters;

        const match = {};
        const currentDate = new Date();

        // Match userId
        if (userId) match.userId = userId;

        // Match types (array)
        if (Array.isArray(type) && type.length > 0) {
            match.type = { $in: type.map(t => parseInt(t)) };
        }

        // Match statuses (array)
        if (Array.isArray(status) && status.length > 0) {
            match.status = { $in: status.map(s => parseInt(s)) };
        }

        // Date filtering
        let dateRange = {};
        if (date === 'today' || !date) {
            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0);
            dateRange = { datetime: { $gte: startOfDay, $lte: currentDate } };
        } else if (date === 'yesterday') {
            const yesterday = new Date(currentDate);
            yesterday.setDate(yesterday.getDate() - 1);
            const start = new Date(yesterday.setHours(0, 0, 0, 0));
            const end = new Date(yesterday.setHours(23, 59, 59, 999));
            dateRange = { datetime: { $gte: start, $lte: end } };
        } else if (date === 'last7days') {
            const sevenDaysAgo = new Date(currentDate);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateRange = { datetime: { $gte: sevenDaysAgo, $lte: currentDate } };
        }

        // Apply date range to match
        if (Object.keys(dateRange).length > 0) {
            match.datetime = dateRange.datetime;
        }

        // MongoDB aggregation
        const result = await Transaction.aggregate([
            { $match: match },
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$datetime"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: "$date",
                        type: "$type",
                        status: "$status"
                    },
                    transactions: {
                        $push: {
                            transactionID: "$transactionID",
                            _id: "$_id",
                            amount: "$amount",
                            base_amount: "$base_amount",
                            mobile: "$mobile",
                            type: "$type",
                            status: "$status",
                            details: "$details",
                            payment_type: "$payment_type",
                            gateway_name: "$gateway_name",
                            datetime: "$datetime",
                            updatetime: "$updatetime"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    type: "$_id.type",
                    status: "$_id.status",
                    transactions: 1
                }
            },
            {
                $sort: { date: -1 }
            }
        ]);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error getting transaction history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get transaction history",
            error: error.message
        });
    }
};



exports.getTransactionDepositTotals = async (req, res) => {
    try {
        const { referralCode } = req.body;

        // Get date ranges
        const now = new Date();
        const lastDay = new Date();
        lastDay.setDate(now.getDate() - 1);

        const last7Days = new Date();
        last7Days.setDate(now.getDate() - 7);

        const last30Days = new Date();
        last30Days.setDate(now.getDate() - 30);



        // Aggregate query
        const results = await Transaction.aggregate([
            {
                $match: {
                    referredBy: referralCode,
                    type: 0, // Only deposits
                    status: 0, // Accepted transactions only
                    datetime: { $gte: last30Days }, // Only fetch last 30 days' data
                },
            },
            {
                $project: {
                    amount: 1,
                    period: {
                        $cond: {
                            if: { $gte: ["$datetime", lastDay] },
                            then: "lastDay",
                            else: {
                                $cond: {
                                    if: { $gte: ["$datetime", last7Days] },
                                    then: "last7Days",
                                    else: "last30Days"
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$period",
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);



        // Initialize summary
        let summary = {
            lastDay: 0,
            last7Days: 0,
            last30Days: 0
        };

        results.forEach(item => {
            summary[item._id] = item.totalAmount;
        });

        res.json({ success: true, data: summary });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.chatsSummary = async (req, res) => {
    try {
        const { referralCode, startDate, endDate } = req.body;

        if (!referralCode) {
            return res.status(400).json({ message: "referralCode is required" });
        }

        // Convert startDate and endDate to Date objects
        const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
        const end = endDate ? new Date(endDate) : new Date();

        // Calculate last full day, last 7 days, and last 30 days
        const lastDay = new Date();
        lastDay.setDate(lastDay.getDate() - 1);
        lastDay.setHours(0, 0, 0, 0);

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        last30Days.setHours(0, 0, 0, 0);

        // Filter for accepted transactions with the referredBy
        const filter = { referredBy: referralCode, status: 0, type: 0 };

        const totals = await Promise.all([
            // Last day total
            Transaction.aggregate([
                { $match: { ...filter, datetime: { $gte: lastDay } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Last 7 days total
            Transaction.aggregate([
                { $match: { ...filter, datetime: { $gte: last7Days } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Last 30 days total
            Transaction.aggregate([
                { $match: { ...filter, datetime: { $gte: last30Days } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Custom date range total
            Transaction.aggregate([
                { $match: { ...filter, datetime: { $gte: start, $lte: end } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } }, total: { $sum: "$amount" } } },
                { $sort: { _id: 1 } }
            ]),
        ]);

        res.json({
            lastDayTotal: totals[0][0]?.total || 0,
            last7DaysTotal: totals[1][0]?.total || 0,
            last30DaysTotal: totals[2][0]?.total || 0,
            customDateData: totals[3] || [],
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getTransactionWidthrawTotals = async (req, res) => {
    try {
        const { referralCode } = req.body;

        // Get date ranges
        const now = new Date();
        const lastDay = new Date();
        lastDay.setDate(now.getDate() - 1);

        const last7Days = new Date();
        last7Days.setDate(now.getDate() - 7);

        const last30Days = new Date();
        last30Days.setDate(now.getDate() - 30);

        console.log("Referred by Code:", referralCode);

        // Aggregate query
        const results = await Transaction.aggregate([
            {
                $match: {
                    referredBy: referralCode,
                    type: 1, // Only deposits
                    status: 1, // Accepted transactions only
                    datetime: { $gte: last30Days }, // Only fetch last 30 days' data
                },
            },
            {
                $project: {
                    amount: 1,
                    period: {
                        $cond: {
                            if: { $gte: ["$datetime", lastDay] },
                            then: "lastDay",
                            else: {
                                $cond: {
                                    if: { $gte: ["$datetime", last7Days] },
                                    then: "last7Days",
                                    else: "last30Days"
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$period",
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);

        console.log("Results:", results);

        // Initialize summary
        let summary = {
            lastDay: 0,
            last7Days: 0,
            last30Days: 0
        };

        results.forEach(item => {
            summary[item._id] = item.totalAmount;
        });

        res.json({ success: true, data: summary });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};





exports.totalWidthraw = async (req, res) => {
    try {
        const { referralCode } = req.body;
        console.log("totalWidthraw", referralCode);
        if (!referralCode) {
            return res.status(400).json({ error: "referredBy is required" });
        }
        const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: subAdmin.referralCode, type: 1, status: 1 } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({ totalDeposit: totalDeposit.length > 0 ? totalDeposit[0].total : 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}




exports.totalDeposit = async (req, res) => {
    try {

        console.log("totalDeposit", req.body.referralCode);
        const { referralCode } = req.body;
        if (!referralCode) {
            return res.status(400).json({ error: "referredBy is required" });
        }
        const subAdmin = await SubAdmin.findOne({ referralCode: referralCode });
        const totalDeposit = await Transaction.aggregate([
            { $match: { referredBy: subAdmin.referralCode, type: 0, status: 1 } }, // Filter deposits & accepted transactions
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({ totalDeposit: totalDeposit.length > 0 ? totalDeposit[0].total : 0 });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////
















//////////////////////////////////////////////sub admin  user details //////////////////////////////


exports.getUserTransactionHistory = async (req, res) => {
    try {
        const { userId, referralCode } = req.body;
        const transactions = await Transaction.find({ userId: userId, referredBy: referralCode });
        res.json({ transactions });
    } catch (error) {
        console.error("Error searching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }

}


exports.GetAllUser_For_Sub_Admin = async (req, res) => {


    try {
        console.log(req.body);
        const { referralCode, userId, email, phone } = req.body;
        console.log(referralCode);
        if (!referralCode) {
            return res.status(400).json({ message: "Referral code is required" });
        }
        console.log(req.body.referralCode);
        // Check if SubAdmin exists
        const subAdminExists = await SubAdmin.findOne({ referralCode: referralCode });
        console.log(subAdminExists)
        if (!subAdminExists) {
            return res.status(404).json({ message: 'SubAdmin not found' });
        }

        let query = { referredBy: subAdminExists.referralCode };

        // Only apply filters if provided
        if (userId) {
            query.userId = userId;
        }
        if (email) {
            query.email = email;
        }
        if (phone) {
            query.phone[0].number = phone;
        }

        // Fetch users using aggregation
        const users = await User.aggregate([
            // First, match the referralByCode
            {
                $match: { referredBy: subAdminExists.referralCode }
            },

            {
                $match: query
            },
            {
                $project: {
                    userId: 1,
                    name: 1,
                    phone: 1,
                    balance: 1,
                    referredBy: 1,
                    referralCode: 1,
                    email: 1,
                    country: 1,
                    countryCode: 1,
                    isVerified: 1,
                    timestamp: 1,
                    isActive: 1,
                    birthday: 1,
                    last_game_id: 1,
                },
            },
        ]);
        console.log(users)
        // if (users.length === 0) {
        //     return res.status(404).json({ message: 'No users found' });
        // }

        return res.json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//////////////////////////////////////////////sub admin  user details //////////////////////////////








exports.WidthdrawListByUser = async (req, res) => {
    // console.log(req.body);
    try {
        const { referralCode } = req.body;
        console.log(referralCode);

        // Find the user based on the referredCode
        const users = await User.find({ referredBy: referralCode });
        console.log(users);
        // If user not found, return 404
        if (!users) {
            return res.status(404).json({ message: 'User not found' });
        }
        const transactions = await Transaction.find({ referredBy: users.referredBy, status: 0 });

        const transactionscount = await Transaction.find({ referredBy: users.referredBy, status: 0 }).countDocuments();
        res.status(200).json({ transactionscount, transactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}



// Get list of active payment methods for user with time validation














///////////////////////////////////////









