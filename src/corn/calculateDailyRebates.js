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
const AffiliateModel = require("../Models/AffiliateModel");
const { addBonusToUser } = require("../Healper/bonusService");
const calculateDailyRebates = async () => {
  try {
    const now = new Date();
    const sessionStart = new Date(now);
    sessionStart.setMinutes(sessionStart.getMinutes() - 5); // Last 5 minutes session

    const todayStr = moment(now).format("YYYY-MM-DD");
    console.log(`🌀 Daily Rebate Bonus cron started at ${moment(now).format('YYYY-MM-DD HH:mm:ss')}`);

    const settings = await RebateSetting.find({ active: true });
    const bonus = await Bonus.findOne({bonusType : 'dailyRebate'});

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

      for (const user of users) {
        if (totalBets >= bonus.minTurnover && totalBets <= bonus.maxTurnover) {
          const rebateAmount = parseFloat(((totalTurnover * minTurnover.percentage) / 100).toFixed(2));

          try {
            // Update user balance
            // await User.updateOne(
            //   { userId: user.userId },
            //   {
            //     $inc: { balance: rebateAmount, totalBonus: rebateAmount },
            //     $set: { updatetimestamp: new Date() }
            //   }
            // );

            // Check if user was referred by an affiliate
            if (user.referredBy) {
                    const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });
            
                    if (affiliate) {
                      const deductionAmount = bonusAmount * (affiliate.settings.platformFee / 100);
            
                      // Deduct from affiliate
                      await AffiliateModel.updateOne(
                        { _id: affiliate._id },
                        {
                          $inc: {
                            balance: -deductionAmount,
                            totalCommission: -deductionAmount,
                            availableBalance: -deductionAmount,
                          },
                        }
                      );
            
                      // Record in AffiliateEarnings (monthly)
                      await AffiliateEarnings.updateOne(
                        { affiliateId: affiliate._id, period: moment().startOf('month').toDate() },
                        {
                          $inc: {
                            totalBonus: rebateAmount,
                            totalDeduction: deductionAmount,
                            netProfit: -deductionAmount,
                            finalCommission: -deductionAmount,
                          },
                        },
                        { upsert: true }
                      );
            
                      // Add bonus to user
                      await addBonusToUser({
                         user: user.userId,
                      bonusId: bonus._id,
                      amount: rebateAmount,
                      bonusType: bonus.bonusType,
                      referredBy: null,
                      totalTurnover:rebateAmount,
                      turnoverMultiplier: bonus.wageringRequirement,
                      message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`,
                      expiryDate: moment().add(7, 'days').toDate()
                      });
                    }
                  } else {
              // Record in UserBonus for tracking
              await addBonusToUser({
                user,
                bonusId: bonus._id,
                amount: rebateAmount,
                bonusType: bonus.bonusType,
                referredBy: null,
                totalTurnover: rebateAmount,
                turnoverMultiplier: bonus.wageringRequirement,
                message: `আপনি আজকের রিবেট বোনাস হিসেবে ${rebateAmount}৳ পেয়েছেন!`,
                expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
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