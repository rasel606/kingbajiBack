const moment = require("moment");


const BettingHistory = require("../Models/BettingHistory");
const User = require("../Models/User");
const RebateSetting = require("../Models/RebateSetting");
const RebateLog = require("../Models/RebateLog");
const UserBonus = require("../Models/UserBonus");
const createNotification = require("../Controllers/notificationController");
const Bonus = require("../Models/Bonus");

exports.calculateDailyRebates = async () => {
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

      const bets = await BettingHistory.aggregate([
        {
          $match: {
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

      for (const bet of bets) {
        const userId = bet._id;
        const turnover = bet.totalTurnover;
        const totalBets = bet.totalBets;

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

            const user = await User.findOne({ userId });
            console.log("user", user);
            await UserBonus.create({
              userId: user.userId,
              bonusId: bonus._id,
              amount: rebateAmount,
              bonusAmount: rebateAmount,
              completedTurnover: totalBets,
              turnoverRequirement: turnover,
              status: "completed",
              updatedAt: new Date()
            });

            await createNotification(
              'দৈনিক রিবেট বোনাস',
              user.userId,
              `আপনি ${setting.rebatePercentage}% (${rebateAmount}৳) বোনাস পেয়েছেন!`,
              'balance_added',
              {
                amount: rebateAmount
              }
            );

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

    console.log('✅ Daily Loss Bonus cron finished');
  } catch (err) {
    console.error('❌ Daily Loss Bonus cron error:', err);
  }
};

// Run every day at 01:00 AM (BD time = 19:00 UTC)
// cron.schedule('10 1 * * *', dailyLossBonusCrons, {
//   timezone: 'Asia/Dhaka'
// });


