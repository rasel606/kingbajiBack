// cronJobs/dailyRewardJob.js

const cron = require('node-cron');
const { calculateDailyRewards } = require('./rewardProcessor');

// প্রতি রাত ১:০০ টায় রান হবে
cron.schedule('0 1 * * *', async () => {
  console.log('⏰ Running Daily Reward Job...');
  await calculateDailyRewards();
});

