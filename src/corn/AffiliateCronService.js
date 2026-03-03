const cron = require('node-cron');
const { calculateMonthlyCommission, payCommissions } = require('../Services/AffiliateCommissionService');

// Schedule monthly commission calculation (run on 1st of each month at 2 AM)
cron.schedule('0 2 1 * *', async () => {
  console.log('Running monthly commission calculation...');
  await calculateMonthlyCommission();
});

// Schedule commission payments (run from 5th-10th of each month at 3 AM)
cron.schedule('0 3 5-10 * *', async () => {
  console.log('Running commission payments...');
  await payCommissions();
});

// Start cron jobs
exports.startCronJobs = () => {
  console.log('Affiliate cron jobs started');
};