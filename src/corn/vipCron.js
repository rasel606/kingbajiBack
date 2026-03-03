const cron = require('node-cron');
const vipService = require('../Services/VipService');
const logger = require('../utils/logger');
const config = require('../Config/env');
const BettingHistoryJob = require('./src/corn/BettingHistoryJob');
const VipUpdate = require('./src/corn/VipUpdate');
const rewardProcessor = require('./src/Services/rewardProcessor');
const bettingHistoryService = require('./src/Services/bettingHistoryService');
// const chatSocketHandler = require('./src/Healper/chatSocketHandler');
const TurnOverJob = require('./src/corn/TurnOverJob');
const weeklyLossBonusCrons = require('./src/corn/weeklyLossBonusCron');
const calculateDailyRebates = require('./src/corn/calculateDailyRebates');
// Daily VIP calculation
cron.schedule(config.vip.dailyCron, async () => {
  logger.info('🏅 Starting daily VIP calculation...');
  try {
    const result = await vipService.calculateDailyVipPoints();
    logger.info(`VIP Daily Calculation: ${result.message}`);
  } catch (error) {
    logger.error(`VIP Daily Calculation Error: ${error.message}`);
  }
});

// Monthly VIP processing
cron.schedule(config.vip.monthlyCron, async () => {
  logger.info('📅 Starting monthly VIP processing...');
  try {
    const result = await vipService.processMonthlyVipBonuses();
    logger.info(`VIP Monthly Processing: ${result.message}`);
  } catch (error) {
    logger.error(`VIP Monthly Processing Error: ${error.message}`);
  }
});

// For testing: Run every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('🧪 Testing VIP cron jobs...');
    // Uncomment to test
    await vipService.calculateDailyVipPoints();
    await vipService.processMonthlyVipBonuses();
  });
}

module.exports = cron;