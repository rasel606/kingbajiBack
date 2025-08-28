// services/bonusService.js
const AffiliateEarnings = require('../Models/AffiliateEarnings');
const UserBonus = require('../Models/UserBonus');
const BettingHistory = require('../Models/BettingHistory');
const moment = require('moment');

class BonusService {
  constructor() {
    this.bonusTypes = {
      DAILY_REBATE: 'daily_rebate',
      WEEKLY_BONUS: 'weekly_bonus',
      DEPOSIT_BONUS: 'deposit_bonus',
      USER_BONUS: 'user_bonus'
    };
  }

  async calculateDailyRebates(affiliateId) {
    const today = moment().startOf('day');
    const settings = await RebateSetting.find({ active: true });
    
    // Get all players under this affiliate
    const players = await User.find({ referredByAffiliate: affiliateId });
    
    let totalRebate = 0;
    let playerCount = 0;
    
    for (const player of players) {
      const bets = await BettingHistory.aggregate([
        {
          $match: {
            member: player.userId,
            start_time: { $gte: today.toDate() }
          }
        },
        {
          $group: {
            _id: null,
            totalTurnover: { $sum: "$turnover" }
          }
        }
      ]);
      
      const turnover = bets[0]?.totalTurnover || 0;
      
      for (const setting of settings) {
        if (turnover >= setting.minTurnover) {
          const rebateAmount = turnover * (setting.rebatePercentage / 100);
          totalRebate += rebateAmount;
          playerCount++;
          break;
        }
      }
    }
    
    // Update affiliate earnings with this deduction
    const currentMonth = moment().startOf('month').toDate();
    
    await AffiliateEarnings.findOneAndUpdate(
      { affiliateId, period: currentMonth },
      {
        $inc: { 
          totalBonus: totalRebate,
          totalDeduction: totalRebate 
        },
        $push: {
          bonusDeductions: {
            type: this.bonusTypes.DAILY_REBATE,
            amount: totalRebate,
            count: playerCount,
            description: `Daily rebate for ${playerCount} players`
          }
        }
      },
      { upsert: true }
    );
    
    return { totalRebate, playerCount };
  }

  async calculateWeeklyLossBonus(affiliateId) {
    const oneWeekAgo = moment().subtract(7, 'days').startOf('day');
    const players = await User.find({ referredByAffiliate: affiliateId });
    
    let totalBonus = 0;
    let playerCount = 0;
    
    for (const player of players) {
      const deposits = await Transaction.find({
        userId: player.userId,
        type: 'deposit',
        status: 'completed',
        createdAt: { $gte: oneWeekAgo.toDate() }
      });
      
      const totalDeposit = deposits.reduce((sum, trx) => sum + trx.amount, 0);
      const bonusAmount = totalDeposit * 0.01; // 1% bonus
      
      if (bonusAmount > 0) {
        totalBonus += bonusAmount;
        playerCount++;
      }
    }
    
    // Update affiliate earnings
    const currentMonth = moment().startOf('month').toDate();
    
    await AffiliateEarnings.findOneAndUpdate(
      { affiliateId, period: currentMonth },
      {
        $inc: { 
          totalBonus: totalBonus,
          totalDeduction: totalBonus 
        },
        $push: {
          bonusDeductions: {
            type: this.bonusTypes.WEEKLY_BONUS,
            amount: totalBonus,
            count: playerCount,
            description: `Weekly loss bonus for ${playerCount} players`
          }
        }
      },
      { upsert: true }
    );
    
    return { totalBonus, playerCount };
  }

  async processAllBonusesForAffiliate(affiliateId) {
    const results = {
      dailyRebate: await this.calculateDailyRebates(affiliateId),
      weeklyBonus: await this.calculateWeeklyLossBonus(affiliateId),
      // Add other bonus types here
    };
    
    // Recalculate net profit after all bonuses
    await this.calculateNetProfit(affiliateId);
    
    return results;
  }

  async calculateNetProfit(affiliateId) {
    const currentMonth = moment().startOf('month').toDate();
    const earnings = await AffiliateEarnings.findOne({ 
      affiliateId, 
      period: currentMonth 
    });
    
    if (!earnings) return;
    
    // Calculate net profit after all deductions
    earnings.netProfit = earnings.totalProfitLoss - 
                        earnings.totalDeduction - 
                        (earnings.totalProfitLoss * 0.20); // 20% platform fee
    
    await earnings.save();
  }
}

module.exports = new BonusService();