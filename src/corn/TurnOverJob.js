const cron = require('node-cron');
const UserBonus = require('../Models/UserBonus');
const BettingHistory = require('../Models/BettingHistory');
const Bonus = require('../Models//Bonus');


// Run every minute
const TurnOverJob = async () => {


  try {
    const now = new Date();
    const activeBonuses = await UserBonus.find({
      status: 'active',
      expiryDate: { $gt: new Date() }
    }).populate('bonusId');

    for (const bonus of activeBonuses) {
      const { _id, userId, createdAt, expiryDate, bonusId } = bonus;

      const eligibleGames = bonusId?.eligibleGames || [];

      const matchQuery = {
        member: userId,
        start_time: { $gte: createdAt, $lte: expiryDate }
      };

      if (eligibleGames.length && eligibleGames[0] !== 'all') {
        matchQuery.game_id = { $in: eligibleGames };
      }

      const result = await BettingHistory.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, totalTurnover: { $sum: '$turnover' } } }
      ]);

      const completedTurnover = result[0]?.totalTurnover || 0;
      const status = completedTurnover >= bonus.turnoverRequirement ? 'completed' : 'active';

      await UserBonus.updateOne(
        { _id },
        {
          completedTurnover,
          status,
          updatedAt: new Date()
        }
      );
//  console.log('🔄 Running Turnover Auto Update...');
  
      // console.log(
      //   `Turnover updated for bonus ${_id}: Completed Turnover: ${completedTurnover}, Status: ${status}`
      // );
      // console.log(`Turnover updated for bonus ${UserBonus}: Completed Turnover: ${completedTurnover}, Status: ${status}`);
    }

    console.log('✅ Turnover auto-update completed');
  } catch (error) {
    console.error('❌ Turnover auto-update failed:', error.message);
  }

}
 
  // cron.schedule('* * * * *', TurnOverJob);

  cron.schedule('10 1 * * *', async () => {
    console.log("TurnOverJob Cron job started at", new Date());
    await TurnOverJob();
  });

module.exports = TurnOverJob;