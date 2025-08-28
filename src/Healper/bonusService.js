const User = require('../Models/User');
const UserBonus = require('../Models/UserBonus');
const { createNotification } = require('../Controllers/notificationController');

const addBonusToUser = async ({
    user,
    bonusId,
    amount,
    turnoverMultiplier = 10,
    totalBets,
    totalTurnover,
    bonusType,
    referredBy = null,
    message = null,
    expiryDate = null
}) => {
    try {
        const bonusTitleMap = {
            deposit: "ডিপোজিট বোনাস",
            dailyRebate: "দৈনিক রিবেট বোনাস",
            weeklyBonus: "সাপ্তাহিক ক্ষতির বোনাস",
            vip: "ভিআইপি বোনাস",
            referral: "রেফারেল বোনাস",
            other: "অন্যান্য বোনাস"
        };

        const title = bonusTitleMap[bonusType] || "বোনাস";

        // Update user balance
        await User.updateOne(
            { userId: user.userId },
            {
                $inc: { balance: amount, totalBonus: amount },
                $set: { updatetimestamp: new Date() }
            }
        );

        // Create bonus record
        await UserBonus.create({
            userId: user.userId,
            bonusId,
            amount,
            remainingAmount: 0,
            turnoverRequirement: turnoverRequirement ? totalTurnover * (turnoverMultiplier / 100): turnoverRequirement,
            completedTurnover: turnoverRequirement ? 'active': 'completed' ,
            status: "completed",
            referredBy,
            bonusType,
            expiryDate
        });

        // Send Notification
        await createNotification(
            title,
            user.userId,
            message || `আপনি ${amount}৳ ${title} পেয়েছেন!`,
            "balance_added",
            { amount }
        );

        return true;
    } catch (error) {
        console.error(`❌ addBonusToUser error for ${user.userId}:`, error);
        return false;
    }
};

module.exports = {
    addBonusToUser
};
