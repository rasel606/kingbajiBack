const cron = require("node-cron");
const BettingHistory = require("../Models/BettingHistory");
const TurnOverModal = require("../Models/TurnOverModal");

const updateDailyTurnover = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Aggregate total turnover per user (member)
    const turnovers = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: "$member", // assuming member is the userId
          totalTurnover: { $sum: "$turnover" }
        }
      }
    ]);

    // 2. Store or update TurnOverModal per user
    for (const entry of turnovers) {
      const { _id: userId, totalTurnover } = entry;

      // Upsert: either update today's record or create new
      await TurnOverModal.findOneAndUpdate(
        {
          userId: userId,
          type: "bettingturnover",
          earnedAt: { $gte: todayStart, $lte: todayEnd }
        },
        {
          userId: userId,
          turnoverAmount: totalTurnover,
          type: "bettingturnover",
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log("✅ Daily turnover updated successfully");
  } catch (error) {
    console.error("❌ Error updating daily turnover:", error.message);
  }
};

// Schedule job to run every day at 00:10 AM
cron.schedule("* * * * *", async () => {
  console.log("🕛 Running Daily Turnover Update Job...");
  await updateDailyTurnover();
});

module.exports = updateDailyTurnover;
