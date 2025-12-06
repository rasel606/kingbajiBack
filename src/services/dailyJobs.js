// const referralService = require('./referralService');
// const { scheduleJob } = require('node-schedule');

// // Schedule daily job at 00:01 AM
// const setupDailyJobs = () => {
//   // Calculate referral bonuses every day at 00:01 AM
//   scheduleJob('0 1 0 * * *', async () => {
//     console.log('⏰ Running daily referral bonus calculation...');
//     try {
//       await referralService.calculateDailyReferralBonuses();
//       console.log('✅ Daily referral bonus calculation completed');
//     } catch (error) {
//       console.error('❌ Error in daily referral bonus calculation:', error);
//     }
//   });
  
//   console.log('⏰ Daily jobs scheduled');
// };

// module.exports = setupDailyJobs;