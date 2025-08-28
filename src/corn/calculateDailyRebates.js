const moment = require("moment");
const cron = require('node-cron');

const BettingHistory = require("../Models/BettingHistory");
const User = require("../Models/User");
const RebateSetting = require("../Models/RebateSetting");
const RebateLog = require("../Models/RebateLog");
const UserBonus = require("../Models/UserBonus");
const { createNotification } = require("../Controllers/notificationController");
const Bonus = require("../Models/Bonus");
const { format } = require("morgan");
const AffiliateModel = require("../models/AffiliateModel");
const { addBonusToUser } = require("../Healper/bonusService");
const calculateDailyRebates = async () => {
  try {
    const now = new Date();
    const sessionStart = new Date(now);
    sessionStart.setMinutes(sessionStart.getMinutes() - 5); // Last 5 minutes session

    const todayStr = moment(now).format("YYYY-MM-DD");
    console.log(`🌀 Daily Rebate Bonus cron started at ${moment(now).format('YYYY-MM-DD HH:mm:ss')}`);

    const settings = await RebateSetting.find({ active: true });
    const bonus = await Bonus.findById("685afbdf7af170ea4dfaf7fc");

    if (!bonus) {
      console.log("❌ Bonus config not found");
      return;
    }

    const users = await User.find({});

    for (const user of users) {
      const bets = await BettingHistory.aggregate([
        {
          $match: {
            member: user.userId,
            start_time: { $gte: sessionStart, $lte: now },
          },
        },
        {
          $group: {
            _id: "$member",
            totalTurnover: { $sum: "$turnover" },
            totalBets: { $sum: 1 },
          },
        },
      ]);

      if (!bets.length) continue;

      const { totalTurnover, totalBets } = bets[0];

      for (const setting of settings) {
        if (totalBets >= setting.minTurnover && totalBets <= setting.maxTurnover) {
          const rebateAmount = parseFloat(((totalTurnover * setting.rebatePercentage) / 100).toFixed(2));

          try {
            // Create rebate log
            await RebateLog.create({
              userId: user.userId,
              totalTurnover,
              totalBets,
              rebateAmount,
              percentageApplied: setting.rebatePercentage,
              date: moment(now).startOf("day").toDate(),
              sessionStart,
              sessionEnd: now,
            });

            // Update user balance
            await User.updateOne(
              { userId: user.userId },
              {
                $inc: { balance: rebateAmount, totalBonus: rebateAmount },
                $set: { updatetimestamp: new Date() }
              }
            );

            // Check if user was referred by an affiliate
            if (user.referredBy) {
              const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });

              if (affiliate) {
                // Calculate affiliate commission (example: 20% of the rebate)
                const commissionRate = affiliate.settings?.commissionRate || 55;
                const platformFee = affiliate.settings?.platformFee || 20;

                const commissionAmount = parseFloat((rebateAmount * (commissionRate / 100)).toFixed(2));
                const afterPlatformFee = parseFloat((commissionAmount * (1 - platformFee / 100)).toFixed(2));

                // Update affiliate's balance and stats
                await AffiliateModel.updateOne(
                  { referralCode: user.referredBy },
                  {
                    $inc: {
                      balance: afterPlatformFee,
                      availableBalance: afterPlatformFee,
                      totalCommission: afterPlatformFee
                    }
                  }
                );

                // Record in UserBonus for tracking
                await addBonusToUser({
                user,
                bonusId: bonus._id,
                amount: rebateAmount,
                totalBets: totalBets,
                totalTurnover: totalTurnover,
                bonusType: 'dailyRebate',
                referredBy: user.referredBy,
                message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
              });
                // Create affiliate earnings record
                await AffiliateEarnings.create({
                  affiliateId: affiliate._id,
                  period: new Date(now.getFullYear(), now.getMonth(), 1),
                  dailyRebate: commissionAmount,
                  netProfit: afterPlatformFee,
                  status: 'pending'
                });
              }
            }
            else {
              // Record in UserBonus for tracking
              await addBonusToUser({
                user,
                bonusId: bonus._id,
                amount: rebateAmount,
                totalBets: totalBets,
                totalTurnover: totalTurnover,
                bonusType: 'dailyRebate',
                message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`
              });
            }

            console.log(`✅ ${moment().format('HH:mm:ss')} - Bonus ৳${rebateAmount} added to ${user.userId}`);

            break; // Stop checking other settings if one is applied
          } catch (err) {
            if (err.code === 11000) {
              console.log(`⚠️ Duplicate rebate for ${user.userId} on ${todayStr}`);
            } else {
              console.error(`❌ Error for user ${user.userId}:`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Daily Rebate Bonus cron error:", err);
  }
};

// Schedule to run daily at 1:10 AM
cron.schedule('* * * * *', async () => {
  console.log("🧪 Running calculateDailyRebates...");
  await calculateDailyRebates();
});

module.exports = calculateDailyRebates;