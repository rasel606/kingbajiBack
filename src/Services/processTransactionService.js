
const TransactionModel = require("../models/TransactionModel");
const User = require("../models/User");
const Bonus = require("../models/Bonus");
const UserBonus = require("../models/UserBonus");
const notificationController = require("../Controllers/notificationController");
const { getUserWithReferralLevels, getReferralOwner } = require("./getReferralOwner");

// ✅ Process Transaction (Deposit / Withdraw / Reject) with Affiliate bonus deduction
const processTransaction = async ({ userId, action, transactionID, referralUser }) => {
    // 1️⃣ User & Referral Validation

    console.log("processTransaction", userId, action, transactionID, referralUser);
    const user = await getUserWithReferralLevels(userId);
    if (!user) throw new Error("User not found or referral mismatch");

    console.log("processTransaction referralUser", referralUser);
    const referralData = await getReferralOwner(referralUser.referralCode);
    console.log("processTransaction referralData", referralData);
    if (!referralData) throw new Error("Invalid referral owner");

    const paymentOwner =
        referralData.role === "affiliate" ? referralData.subAdmin : referralData.owner;
    if (!paymentOwner) throw new Error("Payment owner not found");

    // 2️⃣ Find Transaction
    let transaction = await TransactionModel.findOne({ transactionID, status: 0 });
    if (!transaction) throw new Error("Transaction not found or already processed");

    const baseAmount = parseFloat(transaction.amount);
    const type = transaction.type;
    if (isNaN(baseAmount) || baseAmount <= 0) throw new Error("Invalid amount");

    // ✅ Reject Transaction
    if (action === "reject") {
        transaction = await TransactionModel.findOneAndUpdate(
            { transactionID },
            { status: 2 },
            { new: true }
        );
        await notificationController.createNotification(
            `Transaction Rejected (${transactionID})`,
            user.userId,
            `Your ${parseInt(type) === 0 ? "deposit" : "withdrawal"} of ${baseAmount} was rejected.`,
            "rejected",
            { amount: baseAmount, transactionID }
        );
        return { status: 2, transaction };
    }

    // ✅ Deposit Transaction
    if (parseInt(type) === 1) {
        let bonusAmount = 0,
            bonusId = null,
            turnoverRequirement = 0;

        const depositBonus = await Bonus.findOne({
            bonusType: "deposit",
            isActive: true,
            _id: transaction.bonusId,
            minDeposit: { $lte: baseAmount },
        }).sort({ minDeposit: -1 });

        if (transaction.bonusId && depositBonus) {
            bonusAmount =
                depositBonus.fixedAmount ||
                Math.floor((baseAmount * depositBonus.percentage) / 100);
            if (depositBonus.maxBonus && bonusAmount > depositBonus.maxBonus)
                bonusAmount = depositBonus.maxBonus;

            bonusId = depositBonus._id;
            turnoverRequirement =
                (baseAmount + bonusAmount) * depositBonus.wageringRequirement;

            // ✅ Deduct bonus from Affiliate if applicable
            if (referralData.role === "affiliate" && referralData.owner) {
                if (referralData.owner.balance < bonusAmount)
                    throw new Error("Affiliate balance insufficient for bonus");
                referralData.owner.balance -= bonusAmount;
                await referralData.owner.save();
            }
        }

        // ✅ Check SubAdmin/Owner balance for deposit
        if (referralData.role !== "admin") {
            if (paymentOwner.balance < baseAmount) {
                throw new Error("SubAdmin/Affiliate balance insufficient");
            }
            paymentOwner.balance -= baseAmount;
        }

        paymentOwner.balance -= baseAmount;
        user.balance += baseAmount;

        transaction = await TransactionModel.findOneAndUpdate(
            { transactionID },
            {
                status: 1,
                bonus_amount: bonusAmount,
                amount: baseAmount + bonusAmount,
                bonusId,
                isBonusApplied: bonusAmount > 0,
                bonusStatus: bonusAmount > 0 ? "active" : undefined,
                turnoverRequirement,
                expiryDate: bonusAmount > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
            },
            { new: true }
        );

        // ✅ Create UserBonus record if bonus applied
        if (bonusAmount > 0) {
            await UserBonus.create({
                userId: user.userId,
                bonusId,
                amount: baseAmount,
                bonusAmount,
                remainingAmount: bonusAmount,
                turnoverRequirement,
                expiryDate: transaction.expiryDate,
                transactionId: transactionID,
            });
        }

        await paymentOwner.save();
        await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });

        await notificationController.createNotification(
            `Deposit Approved (${transactionID})`,
            user.userId,
            `Deposit of ${transaction.amount} has been approved.`,
            "approved",
            { amount: transaction.amount, transactionID }
        );
consolt.log({ status: 1, message: "has been approvedtransaction", transaction })
        return { status: 1, transaction };
    }

    // ✅ Withdraw Transaction
//     if (parseInt(type) === 2) {
//         if (user.balance < baseAmount) throw new Error("User balance insufficient");

//         user.balance -= baseAmount;
//         paymentOwner.balance += baseAmount;

//         transaction = await TransactionModel.findOneAndUpdate(
//             { transactionID },
//             { status: 1 },
//             { new: true }
//         );

//         await User.findOneAndUpdate({ userId: user.userId }, { balance: user.balance });
//         await paymentOwner.save();

//         await notificationController.createNotification(
//             `Withdrawal Approved (${transactionID})`,
//             user.userId,
//             `Withdrawal of ${transaction.amount} has been approved.`,
//             "approved",
//             { amount: transaction.amount, transactionID }
//         );
// consolt.log({ status: 1, message: "has been approvedtransaction", transaction })
//         return { status: 1, transaction };
//     }

    throw new Error("Invalid transaction type");
};

module.exports = { processTransaction };
