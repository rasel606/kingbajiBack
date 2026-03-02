const cron = require('node-cron');
const BonusProcessingService = require('../services/bonus/BonusProcessingService');
const User = require('../models/User');
const UserBonusInstance = require('../models/UserBonusInstance');
const logger = require('../utils/logger');

/**
 * Bonus Automation Jobs
 * সব automatic bonus processing এর জন্য cron jobs
 */
class BonusAutomationJobs {
  
  /**
   * Initialize All Jobs
   * সব cron jobs শুরু করে
   */
  static initializeJobs() {
    console.log('🔄 Initializing Bonus Automation Jobs...');
    
    this.dailyCashbackJob();
    this.weeklyRebateJob();
    this.instantRebateJob();
    this.expireBonusesJob();
    this.weekendDoubleRebateJob();
    this.midnightBonusJob();
    
    console.log('✅ All Bonus Automation Jobs initialized');
  }
  
  /**
   * Daily Cashback Job
   * প্রতিদিন রাত ১২:৩০ মিনিটে cashback process করে
   */
  static dailyCashbackJob() {
    // প্রতিদিন রাত ১২:৩০ BST (Bangladesh Standard Time)
    cron.schedule('30 0 * * *', async () => {
      try {
        console.log('💰 Starting Daily Cashback Processing...');
        logger.info('Daily Cashback Job Started');
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // সব active user
        const users = await User.find({ 
          accountStatus: 'active',
          isDeleted: { $ne: true }
        });
        
        let processedCount = 0;
        let totalCashback = 0;
        let errors = 0;
        
        for (const user of users) {
          try {
            const result = await BonusProcessingService.processCashbackBonus(
              user.userId,
              yesterday,
              today
            );
            
            if (result.success) {
              processedCount++;
              totalCashback += result.bonus.cashbackAmount;
              
              logger.info(`Cashback processed for ${user.username}: ৳${result.bonus.cashbackAmount}`);
            }
          } catch (error) {
            errors++;
            logger.error(`Error processing cashback for ${user.username}:`, error);
          }
        }
        
        console.log(`✅ Daily Cashback Complete: ${processedCount} users, Total: ৳${totalCashback}, Errors: ${errors}`);
        logger.info(`Daily Cashback Summary: Processed=${processedCount}, Total=৳${totalCashback}, Errors=${errors}`);
        
      } catch (error) {
        console.error('❌ Daily Cashback Job Error:', error);
        logger.error('Daily Cashback Job Failed:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Daily Cashback Job scheduled (00:30 BST)');
  }
  
  /**
   * Weekly Rebate Job
   * প্রতি সোমবার সকাল ১০টায় সাপ্তাহিক rebate process করে
   */
  static weeklyRebateJob() {
    // প্রতি সোমবার সকাল ১০টা BST
    cron.schedule('0 10 * * 1', async () => {
      try {
        console.log('🔄 Starting Weekly Rebate Processing...');
        logger.info('Weekly Rebate Job Started');
        
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        
        const lastWeekEnd = new Date();
        lastWeekEnd.setHours(0, 0, 0, 0);
        
        const users = await User.find({ 
          accountStatus: 'active',
          isDeleted: { $ne: true }
        });
        
        let processedCount = 0;
        let totalRebate = 0;
        
        for (const user of users) {
          try {
            const result = await BonusProcessingService.processRebateBonus(
              user.userId,
              lastWeekStart,
              lastWeekEnd
            );
            
            if (result.success) {
              processedCount++;
              totalRebate += result.bonus.rebateAmount;
              
              logger.info(`Weekly Rebate: ${user.username} - ৳${result.bonus.rebateAmount}`);
            }
          } catch (error) {
            logger.error(`Error processing rebate for ${user.username}:`, error);
          }
        }
        
        console.log(`✅ Weekly Rebate Complete: ${processedCount} users, Total: ৳${totalRebate}`);
        logger.info(`Weekly Rebate Summary: Processed=${processedCount}, Total=৳${totalRebate}`);
        
      } catch (error) {
        console.error('❌ Weekly Rebate Job Error:', error);
        logger.error('Weekly Rebate Job Failed:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Weekly Rebate Job scheduled (Monday 10:00 BST)');
  }
  
  /**
   * Instant Rebate Job
   * প্রতি ঘণ্টায় instant rebate process করে
   */
  static instantRebateJob() {
    // প্রতি ঘণ্টায়
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('⚡ Starting Instant Rebate Processing...');
        
        const hourStart = new Date();
        hourStart.setHours(hourStart.getHours() - 1);
        
        const users = await User.find({ 
          accountStatus: 'active',
          'preferences.instantRebate': true
        });
        
        let processedCount = 0;
        
        for (const user of users) {
          try {
            const result = await BonusProcessingService.processRebateBonus(
              user.userId,
              hourStart,
              new Date()
            );
            
            if (result.success) {
              processedCount++;
            }
          } catch (error) {
            // Silent fail for instant rebate
          }
        }
        
        console.log(`✅ Instant Rebate Complete: ${processedCount} users`);
        
      } catch (error) {
        console.error('❌ Instant Rebate Job Error:', error);
      }
    });
    
    console.log('✅ Instant Rebate Job scheduled (Every hour)');
  }
  
  /**
   * Expire Bonuses Job
   * প্রতি ঘণ্টায় expired bonuses update করে
   */
  static expireBonusesJob() {
    // প্রতি ঘণ্টায়
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('⏰ Checking for expired bonuses...');
        
        const result = await BonusProcessingService.expireOldBonuses();
        
        if (result.count > 0) {
          console.log(`✅ Expired ${result.count} bonuses`);
          logger.info(`Expired ${result.count} bonuses`);
        }
        
      } catch (error) {
        console.error('❌ Expire Bonuses Job Error:', error);
        logger.error('Expire Bonuses Job Failed:', error);
      }
    });
    
    console.log('✅ Expire Bonuses Job scheduled (Every hour)');
  }
  
  /**
   * Weekend Double Rebate Job
   * শনি ও রবিবার সকাল ১০টায় double rebate process করে
   */
  static weekendDoubleRebateJob() {
    // শনিবার সকাল ১০টা - শুক্রবারের rebate
    cron.schedule('0 10 * * 6', async () => {
      try {
        console.log('🎉 Processing Saturday Double Rebate...');
        
        const friday = new Date();
        friday.setDate(friday.getDate() - 1);
        friday.setHours(0, 0, 0, 0);
        
        const saturday = new Date();
        saturday.setHours(0, 0, 0, 0);
        
        await this.processDoubleRebate(friday, saturday, 'Saturday');
        
      } catch (error) {
        console.error('❌ Saturday Rebate Error:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    // রবিবার সকাল ১০টা - শনিবারের rebate
    cron.schedule('0 10 * * 0', async () => {
      try {
        console.log('🎉 Processing Sunday Double Rebate...');
        
        const saturday = new Date();
        saturday.setDate(saturday.getDate() - 1);
        saturday.setHours(0, 0, 0, 0);
        
        const sunday = new Date();
        sunday.setHours(0, 0, 0, 0);
        
        await this.processDoubleRebate(saturday, sunday, 'Sunday');
        
      } catch (error) {
        console.error('❌ Sunday Rebate Error:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Weekend Double Rebate Jobs scheduled');
  }
  
  /**
   * Process Double Rebate
   * Weekend এর জন্য 2x rebate process করে
   */
  static async processDoubleRebate(startDate, endDate, day) {
    const users = await User.find({ accountStatus: 'active' });
    
    let processedCount = 0;
    let totalRebate = 0;
    
    for (const user of users) {
      try {
        const result = await BonusProcessingService.processRebateBonus(
          user.userId,
          startDate,
          endDate
        );
        
        if (result.success) {
          // Double the rebate for weekend
          const doubleRebate = result.bonus.rebateAmount * 2;
          
          // Update the bonus instance with double amount
          const bonus = await UserBonusInstance.findOne({ 
            instanceId: result.bonus.instanceId 
          });
          
          if (bonus) {
            bonus.bonusAmount = doubleRebate;
            bonus.metadata.set('isWeekendBonus', true);
            bonus.metadata.set('originalAmount', result.bonus.rebateAmount);
            bonus.metadata.set('multiplier', 2);
            await bonus.save();
            
            processedCount++;
            totalRebate += doubleRebate;
          }
        }
      } catch (error) {
        logger.error(`Error processing ${day} rebate for ${user.username}:`, error);
      }
    }
    
    console.log(`✅ ${day} Double Rebate Complete: ${processedCount} users, Total: ৳${totalRebate}`);
    logger.info(`${day} Double Rebate: Processed=${processedCount}, Total=৳${totalRebate}`);
  }
  
  /**
   * Midnight Bonus Job
   * রাত ১২টা থেকে সকাল ৬টা পর্যন্ত deposit এ extra bonus
   */
  static midnightBonusJob() {
    // প্রতিদিন সকাল ৮টায় গতরাতের midnight bonus process করে
    cron.schedule('0 8 * * *', async () => {
      try {
        console.log('🌙 Processing Midnight Bonus...');
        logger.info('Midnight Bonus Job Started');
        
        // গতরাত ১২টা থেকে আজ সকাল ৬টা
        const midnightStart = new Date();
        midnightStart.setHours(0, 0, 0, 0);
        
        const morningEnd = new Date();
        morningEnd.setHours(6, 0, 0, 0);
        
        // এই সময়ের মধ্যে deposit করা users
        const Transaction = require('../models/Transaction');
        const deposits = await Transaction.find({
          type: 0, // Deposit
          status: 1, // Accepted
          datetime: { $gte: midnightStart, $lte: morningEnd }
        });
        
        let processedCount = 0;
        
        for (const deposit of deposits) {
          try {
            // 4.5% extra bonus + free spins
            const bonusResult = await BonusProcessingService.processDepositBonus(
              deposit.userId,
              deposit.base_amount,
              deposit.transactionId,
              'MIDNIGHT_BONUS'
            );
            
            if (bonusResult.success) {
              processedCount++;
              logger.info(`Midnight bonus for ${deposit.userId}: ৳${bonusResult.bonus.bonusAmount}`);
            }
          } catch (error) {
            logger.error(`Error processing midnight bonus for ${deposit.userId}:`, error);
          }
        }
        
        console.log(`✅ Midnight Bonus Complete: ${processedCount} deposits processed`);
        logger.info(`Midnight Bonus Summary: Processed=${processedCount}`);
        
      } catch (error) {
        console.error('❌ Midnight Bonus Job Error:', error);
        logger.error('Midnight Bonus Job Failed:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Midnight Bonus Job scheduled (08:00 BST)');
  }
  
  /**
   * Daily Check-in Rewards
   * প্রতিদিন check-in rewards process করে
   */
  static dailyCheckInJob() {
    // প্রতিদিন রাত ১২টায় reset
    cron.schedule('0 0 * * *', async () => {
      try {
        console.log('📅 Processing Daily Check-in Rewards...');
        
        // Check-in করা users দের reward দেওয়া
        const CheckIn = require('../models/CheckIn');
        const todayCheckIns = await CheckIn.find({
          date: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        });
        
        for (const checkIn of todayCheckIns) {
          // VIP points এবং spin tickets দেওয়া
          const user = await User.findOne({ userId: checkIn.userId });
          if (user) {
            // Consecutive days এর উপর ভিত্তি করে reward
            const consecutiveDays = checkIn.consecutiveDays || 1;
            const vipPoints = consecutiveDays * 10;
            const spinTickets = Math.floor(consecutiveDays / 3);
            
            // Update user
            user.vipPoints = (user.vipPoints || 0) + vipPoints;
            user.spinTickets = (user.spinTickets || 0) + spinTickets;
            await user.save();
            
            logger.info(`Check-in reward for ${user.username}: ${vipPoints} VIP points, ${spinTickets} spin tickets`);
          }
        }
        
        console.log(`✅ Daily Check-in Rewards Complete`);
        
      } catch (error) {
        console.error('❌ Daily Check-in Job Error:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Daily Check-in Job scheduled');
  }
  
  /**
   * Weekly Lucky Draw
   * প্রতি সোমবার সকালে weekly lucky draw
   */
  static weeklyLuckyDrawJob() {
    // প্রতি সোমবার সকাল ১১টা
    cron.schedule('0 11 * * 1', async () => {
      try {
        console.log('🎰 Processing Weekly Lucky Draw...');
        logger.info('Weekly Lucky Draw Started');
        
        // গত সপ্তাহের সব deposits
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        const Transaction = require('../models/Transaction');
        const deposits = await Transaction.find({
          type: 0,
          status: 1,
          datetime: { $gte: lastWeekStart }
        });
        
        // প্রতি ৳1000 deposit = 1 ticket
        const tickets = [];
        for (const deposit of deposits) {
          const ticketCount = Math.floor(deposit.base_amount / 1000);
          for (let i = 0; i < ticketCount; i++) {
            tickets.push(deposit.userId);
          }
        }
        
        if (tickets.length > 0) {
          // Random winner select
          const winnerIndex = Math.floor(Math.random() * tickets.length);
          const winnerId = tickets[winnerIndex];
          
          // Winner কে iPhone 17 Pro Max prize দেওয়া
          const winner = await User.findOne({ userId: winnerId });
          if (winner) {
            // Prize record তৈরি
            const Prize = require('../models/Prize');
            await Prize.create({
              userId: winnerId,
              prizeType: 'WEEKLY_LUCKY_DRAW',
              prizeName: 'iPhone 17 Pro Max 256GB',
              prizeValue: 150000,
              wonAt: new Date()
            });
            
            console.log(`🎉 Weekly Lucky Draw Winner: ${winner.username}`);
            logger.info(`Weekly Lucky Draw Winner: ${winner.username}, Total Tickets: ${tickets.length}`);
          }
        }
        
      } catch (error) {
        console.error('❌ Weekly Lucky Draw Error:', error);
        logger.error('Weekly Lucky Draw Failed:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Weekly Lucky Draw Job scheduled (Monday 11:00 BST)');
  }
  
  /**
   * Monthly Member Day Bonus
   * প্রতি মাসের ২৬ তারিখে member day bonus
   */
  static monthlyMemberDayJob() {
    // প্রতি মাসের ২৬ তারিখ সকাল ১০টা
    cron.schedule('0 10 26 * *', async () => {
      try {
        console.log('🎊 Processing Monthly Member Day Bonus...');
        logger.info('Monthly Member Day Bonus Started');
        
        const users = await User.find({ 
          accountStatus: 'active',
          isDeleted: { $ne: true }
        });
        
        let processedCount = 0;
        let totalBonus = 0;
        
        for (const user of users) {
          try {
            // VIP level অনুযায়ী bonus
            const bonusAmounts = {
              COPPER: 100,
              BRONZE: 200,
              SILVER: 500,
              GOLD: 1000,
              RUBY: 2000,
              SAPPHIRE: 5000,
              DIAMOND: 10000,
              EMPEROR: 20000
            };
            
            const bonusAmount = bonusAmounts[user.vipLevel] || 100;
            
            // Bonus instance তৈরি
            const instanceId = `MEMBER_DAY_${user.userId}_${Date.now()}`;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            
            await UserBonusInstance.create({
              instanceId,
              userId: user.userId,
              bonusType: 'SPECIAL_EVENT',
              bonusAmount,
              wageringRequired: bonusAmount * 1,
              expiryDate,
              status: 'ACTIVE',
              activatedAt: new Date(),
              metadata: {
                event: 'MONTHLY_MEMBER_DAY',
                vipLevel: user.vipLevel
              }
            });
            
            processedCount++;
            totalBonus += bonusAmount;
            
          } catch (error) {
            logger.error(`Error processing member day bonus for ${user.username}:`, error);
          }
        }
        
        console.log(`✅ Member Day Bonus Complete: ${processedCount} users, Total: ৳${totalBonus}`);
        logger.info(`Member Day Bonus: Processed=${processedCount}, Total=৳${totalBonus}`);
        
      } catch (error) {
        console.error('❌ Member Day Bonus Error:', error);
        logger.error('Member Day Bonus Failed:', error);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
    
    console.log('✅ Monthly Member Day Job scheduled (26th of every month, 10:00 BST)');
  }
  
  /**
   * VIP Level Upgrade Bonus
   * VIP level upgrade হলে bonus দেওয়া
   */
  static async processVIPUpgradeBonus(userId, newLevel, oldLevel) {
    try {
      console.log(`⬆️ Processing VIP Upgrade Bonus: ${oldLevel} → ${newLevel}`);
      
      const upgradeBonuses = {
        BRONZE: 500,
        SILVER: 1000,
        GOLD: 2000,
        RUBY: 5000,
        SAPPHIRE: 10000,
        DIAMOND: 20000,
        EMPEROR: 50000
      };
      
      const bonusAmount = upgradeBonuses[newLevel] || 0;
      
      if (bonusAmount > 0) {
        const instanceId = `VIP_UPGRADE_${userId}_${Date.now()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        await UserBonusInstance.create({
          instanceId,
          userId,
          bonusType: 'VIP_BONUS',
          bonusAmount,
          wageringRequired: bonusAmount * 1,
          expiryDate,
          status: 'ACTIVE',
          activatedAt: new Date(),
          metadata: {
            upgradeFrom: oldLevel,
            upgradeTo: newLevel
          }
        });
        
        console.log(`✅ VIP Upgrade Bonus: ${userId} - ৳${bonusAmount}`);
        logger.info(`VIP Upgrade Bonus: ${userId} upgraded to ${newLevel}, Bonus: ৳${bonusAmount}`);
      }
      
    } catch (error) {
      console.error('❌ VIP Upgrade Bonus Error:', error);
      logger.error('VIP Upgrade Bonus Failed:', error);
    }
  }
}

module.exports = BonusAutomationJobs;
