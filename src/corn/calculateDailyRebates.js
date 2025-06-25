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
console.log('🌀 Daily Loss Bonus cron started');
const calculateDailyRebates = async () => {
  try {
    console.log('🌀 Daily Loss Bonus cron started');

    const today = moment().format('YYYY-MM-DD');
    const settings = await RebateSetting.find({ active: true });

    const bonus = await Bonus.findById("685afbdf7af170ea4dfaf7fc");
    if (!bonus) {
      console.log("❌ Bonus config not found");
      return;
    }

    for (const setting of settings) {
      const sessionStart = moment(`${today} ${setting.sessionStart}`, "YYYY-MM-DD HH:mm");
      const sessionEnd = moment(`${today} ${setting.sessionEnd}`, "YYYY-MM-DD HH:mm");

      const users = await User.find({}); // Find all users
      for (const user of users) {
        console.log("user----------------------1", user);
        const bets = await BettingHistory.aggregate([
          {
            $match: {
              member: user.userId,
              start_time: { $gte: sessionStart.toDate(), $lte: sessionEnd.toDate() }
            }
          },
          {
            $group: {
              _id: "$member",
              totalTurnover: { $sum: "$turnover" },
              totalBets: { $sum: 1 }
            }
          }
        ]);

        console.log("bets----------------------2", bets);
        for (const bet of bets) {
          console.log("bet------------------------1", bet);
          const userId = bet._id;
          const turnover = bet.totalTurnover;
          const totalBets = bet.totalBets;
          console.log("totalBets userId", userId, totalBets, totalBets >= setting.minTurnover && totalBets <= setting.maxTurnover);
          if (totalBets >= setting.minTurnover && totalBets <= setting.maxTurnover) {
            const rebateAmount = parseFloat(((turnover * setting.rebatePercentage) / 100).toFixed(2));

            try {
              await RebateLog.create({
                userId,
                totalTurnover: turnover,
                totalBets,
                rebateAmount,
                percentageApplied: setting.rebatePercentage,
                date: sessionStart.startOf('day').toDate(),
                sessionStart: sessionStart.toDate(),
                sessionEnd: sessionEnd.toDate()
              });

              await User.updateOne(
                { userId },
                {
                  $inc: { balance: rebateAmount, totalBonus: rebateAmount },
                  $set: { updatetimestamp: new Date() }
                }
              );


              console.log("user", user);
              await UserBonus.create({
                userId: user.userId,
                bonusId: bonus._id,
                amount: rebateAmount,
                remainingAmount: rebateAmount,
                completedTurnover: totalBets,
                turnoverRequirement: totalBets,
                status: "completed",
                updatedAt: new Date()
              });

              await createNotification(
                'দৈনিক রিবেট বোনাস',
                user.userId,
                `আপনি আজকে দৈনিক রিবেট বোনাস ${rebateAmount}৳ বোনাস পেয়েছেন!`,
                'balance_added',
                {
                  amount: rebateAmount
                }
              );

              const minBonus = await UserBonus.findOne({ userId: user.userId });

              console.log("minBonus", minBonus);
              console.log(`✅ Bonus given to user ${user.userId}: ${rebateAmount}৳`);
            } catch (err) {
              if (err.code === 11000) {
                console.log(`⚠️ Duplicate rebate for ${userId} on ${today}`);
              } else {
                console.error(`❌ Error processing user ${userId}:`, err);
              }
            }
          }
        }

      }


    }
    console.log(`Daily Loss Bonus given to user ${user.userId}: ${bonusAmount}৳`);
    console.log('✅ Daily Loss Bonus cron finished');
  } catch (err) {
    console.error('❌ Daily Loss Bonus cron error:', err);
  }
};

// Run every day at 01:00 AM (BD time = 19:00 UTC)
// cron.schedule('10 1 * * *', calculateDailyRebates, {
//   timezone: 'Asia/Dhaka'
// });
cron.schedule('10 1 * * *', calculateDailyRebates);
module.exports = calculateDailyRebates;
