const AffiliateModel = require('../Models/AffiliateModel');
const AffiliateEarnings = require('../Models/AffiliateUserEarnings');
const BettingHistory = require('../Models/BettingHistory');
const UserBonus = require('../Models/UserBonus');
const Transaction = require('../Models/TransactionModel');
const User = require('../Models/User');
const { getPeriodDates } = require('../utils/periodUtils');
const redisClient = require('../utils/redisClient');

// Cache configuration
const CACHE_TTL = process.env.CACHE_TTL || 300; // 5 minutes in seconds
const REFERRED_USERS_TTL = process.env.REFERRED_USERS_TTL || 1800; // 30 minutes in seconds

class AffiliateEarningsService {
  async calculateEarnings(affiliateId, currency, forceRefresh = false) {
    try {
      // Check if we have recent cached data (unless force refresh)
      if (!forceRefresh) {
        const cachedData = await this.getCachedEarnings(affiliateId, currency);
        if (cachedData) {
          console.log('Returning cached earnings data for affiliate:', affiliateId);
          return cachedData;
        }
      }

      console.log('Calculating fresh earnings data for affiliate:', affiliateId);
      
      const affiliate = await AffiliateModel.findOne({ userId: affiliateId });
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Get referred users (with caching)
      const referredUsers = await this.getReferredUsers(affiliate.referralCode, affiliateId);
      const referredUserIds = referredUsers.map(u => u.userId);

      const {
        currentPeriodStart,
        currentPeriodEnd
      } = getPeriodDates();

      // Calculate all components in parallel
      const [
        totalProfitLoss,
        jackpotCost,
        totalDeduction,
        turnover,
        totalBonus,
        recycleBalance,
        cancelFee,
        vipCashBonus,
        revenueAdjustment,
        referralCommission,
        paymentFee
      ] = await Promise.all([
        this.calculateTotalProfitLoss(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateJackpotCost(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateTotalDeduction(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateTurnover(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateTotalBonus(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateRecycleBalance(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateCancelFee(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateVIPCashBonus(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateRevenueAdjustment(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculateReferralCommission(referredUserIds, currentPeriodStart, currentPeriodEnd),
        this.calculatePaymentFee(referredUserIds, currentPeriodStart, currentPeriodEnd)
      ]);

      // Calculate derived values
      const negativeProfit = await this.calculateNegativeProfit(affiliateId, currentPeriodStart);
      const netProfit = this.calculateNetProfit(
        totalProfitLoss,
        jackpotCost,
        totalDeduction,
        totalBonus,
        vipCashBonus,
        revenueAdjustment,
        referralCommission,
        paymentFee
      );
      
      const commissionPercent = (affiliate.settings.commissionRate + affiliate.settings.platformFee) / 100;
      const potentialAmount = this.calculatePotentialAmount(netProfit, commissionPercent);

      // Prepare response data
      const earningsData = {
        ggr: totalProfitLoss,
        jackpotCost,
        deduction: totalDeduction,
        turnover,
        bonus: totalBonus,
        recycleBalance,
        cancelFee,
        vipCashBonus,
        revenueAdjustment,
        referralCommission,
        paymentFee,
        negativeProfit,
        netProfit,
        commissionPercent,
        potentialAmount,
        lastUpdated: new Date(),
        fromCache: false
      };

      // Cache the results (don't await, let it happen in background)
      this.cacheEarnings(affiliateId, currency, earningsData).catch(err => {
        console.error('Background caching failed:', err);
      });

      return earningsData;
    } catch (error) {
      console.error('Error calculating earnings:', error);
      throw error;
    }
  }

  async getCachedEarnings(affiliateId, currency) {
    try {
      const cacheKey = redisClient.generateEarningsKey(affiliateId, currency);
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Check if cache is still valid (not too old)
        const cacheAge = Date.now() - new Date(cachedData.lastUpdated).getTime();
        const maxCacheAge = CACHE_TTL * 1000; // Convert to milliseconds
        
        if (cacheAge < maxCacheAge) {
          console.log('Returning valid cached data for affiliate:', affiliateId);
          return { ...cachedData, fromCache: true };
        } else {
          console.log('Cache expired for affiliate:', affiliateId);
          await redisClient.del(cacheKey); // Remove expired cache
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached earnings:', error);
      return null; // Return null on error to proceed with fresh calculation
    }
  }

  async cacheEarnings(affiliateId, currency, earningsData) {
    try {
      const cacheKey = redisClient.generateEarningsKey(affiliateId, currency);
      const success = await redisClient.set(cacheKey, earningsData, CACHE_TTL);
      
      if (success) {
        console.log('Earnings data cached successfully for affiliate:', affiliateId);
      } else {
        console.log('Failed to cache earnings data for affiliate:', affiliateId);
      }
      
      return success;
    } catch (error) {
      console.error('Error caching earnings:', error);
      return false;
    }
  }

  async getReferredUsers(referralCode, affiliateId) {


    console.log('Fetching referred users for affiliate---1:', affiliateId ,"getReferredUsers",referralCode);
    try {
      const cacheKey = redisClient.generateReferredUsersKey(affiliateId);
      const cachedUsers = await redisClient.get(cacheKey);
      
      if (cachedUsers) {
        console.log('Returning cached referred users for affiliate:', affiliateId);
        return cachedUsers;
      }
      
      // Fetch fresh data from database
      console.log('Fetching fresh referred users for affiliate:', affiliateId);
      const referredUsers = await User.find({ referredBy: referralCode });
      
      // Cache the results (don't await, let it happen in background)
      redisClient.set(cacheKey, referredUsers, REFERRED_USERS_TTL).catch(err => {
        console.error('Background caching of referred users failed:', err);
      });
      
      return referredUsers;
    } catch (error) {
      console.error('Error getting referred users:', error);
      // Fallback to database query
      return await User.find({ referredBy: referralCode });
    }
  }

  async invalidateEarningsCache(affiliateId, currency = null) {
    try {
      if (currency) {
        // Invalidate specific currency cache
        const cacheKey = redisClient.generateEarningsKey(affiliateId, currency);
        await redisClient.del(cacheKey);
        console.log('Invalidated earnings cache for affiliate:', affiliateId, 'currency:', currency);
      } else {
        // Invalidate all currency caches for this affiliate
        const currencies = ['BDT', 'USD', 'EUR', 'GBP']; // Add all supported currencies
        for (const curr of currencies) {
          const cacheKey = redisClient.generateEarningsKey(affiliateId, curr);
          await redisClient.del(cacheKey);
        }
        console.log('Invalidated all earnings caches for affiliate:', affiliateId);
      }
      
      // Also invalidate referred users cache
      const usersCacheKey = redisClient.generateReferredUsersKey(affiliateId);
      await redisClient.del(usersCacheKey);
      
      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  // The rest of your methods remain the same...
  async calculateTotalProfitLoss(userIds, startDate, endDate) {
    console.log('Fetching calculateTotalProfitLoss',userIds);
    const result = await BettingHistory.aggregate([
      {
        $match: {
          member: { $in: userIds },
          //start_time: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProfitLoss: { $sum: { $subtract: ['$bet', '$payout'] } }
        }
      }
    ]);
    console.log('Fetching calculateTotalProfitLoss',result);
    return result[0]?.totalProfitLoss || 0;
  }

  async calculateJackpotCost(userIds, startDate, endDate) {

        console.log('Fetching   calculateJackpotCost',userIds,'startDate', startDate,"endDate", endDate);
    const result = await BettingHistory.aggregate([
      {
        $match: {
          member: { $in: userIds },
          //start_time: { $gte: startDate, $lte: endDate },
          jackpotContribution: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalJackpotCost: { $sum: '$jackpotContribution' }
        }
      }
    ]);
    console.log('Fetching   calculateJackpotCost',result);
    return result[0]?.totalJackpotCost || 0;
  }

  async calculateTotalDeduction(userIds, startDate, endDate) {

           console.log('Fetching calculateTotalDeduction',userIds,'startDate', startDate,"endDate", endDate);
    return 0;
  }

  async calculateTurnover(userIds, startDate, endDate) {
           console.log('Fetching calculateTurnover',userIds,'startDate', startDate,"endDate", endDate);
    const result = await BettingHistory.aggregate([
      {
        $match: {
          member: { $in: userIds },
          //start_time: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTurnover: { $sum: '$turnover' }
        }
      }
    ]);
    console.log('Fetching calculateTotalDeduction',result);
    return result[0]?.totalTurnover || 0;
  }

  async calculateTotalBonus(userIds, startDate, endDate) {
           console.log('Fetching calculateTotalBonus',userIds,'startDate', startDate,"endDate", endDate);
    const result = await UserBonus.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBonus: { $sum: '$amount' }
        }
      }
    ]);
    console.log('Fetching calculateTotalBonus',result);
    return result[0]?.totalBonus || 0;
  }

  async calculateRecycleBalance(userIds, startDate, endDate) {

           console.log('Fetching calculateRecycleBalance',userIds,'startDate', startDate,"endDate", endDate);
    return 0;
  }

  async calculateCancelFee(userIds, startDate, endDate) {
           console.log('Fetching calculateVIPCashBonus',userIds,'startDate', startDate,"endDate", endDate);
    const result = await BettingHistory.aggregate([
      {
        $match: {
          member: { $in: userIds },
          //start_time: { $gte: startDate, $lte: endDate },
          status: 'canceled'
        }
      },
      {
        $group: {
          _id: null,
          totalCancelFee: { $sum: '$cancelFee' }
        }
      }
    ]);
    console.log('Fetching calculateVIPCashBonus',result);
    return result[0]?.totalCancelFee || 0;
  }

  async calculateVIPCashBonus(userIds, startDate, endDate) {
           console.log('Fetching calculateVIPCashBonus',userIds,'startDate', startDate,"endDate", endDate);
    const result = await UserBonus.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          createdAt: { $gte: startDate, $lte: endDate },
          bonusType: 'vip_cash'
        }
      },
      {
        $group: {
          _id: null,
          totalVipBonus: { $sum: '$amount' }
        }
      }
    ]);
    console.log('Fetching calculateVIPCashBonus',result);
    return result[0]?.totalVipBonus || 0;
  }

  async calculateRevenueAdjustment(userIds, startDate, endDate) {
           console.log('Fetching calculateRevenueAdjustment',userIds,'startDate', startDate,"endDate", endDate);
    return 0;
  }

  async calculateReferralCommission(userIds, startDate, endDate) {
           console.log('Fetching calculateReferralCommission',userIds,'startDate', startDate,"endDate", endDate);
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          datetime: { $gte: startDate, $lte: endDate },
          type: 'referral_commission'
        }
      },
      {
        $group: {
          _id: null,
          totalReferralCommission: { $sum: '$amount' }
        }
      }
    ]);
    console.log('Fetching calculateReferralCommission',result);
    return result[0]?.totalReferralCommission || 0;
  }

  async calculatePaymentFee(userIds, startDate, endDate) {
           console.log('Fetching calculatePaymentFee',userIds,'startDate', startDate,"endDate", endDate);
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          datetime: { $gte: startDate, $lte: endDate },
          feeAmount: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalPaymentFee: { $sum: '$feeAmount' }
        }
      }
    ]);
    
    return result[0]?.totalPaymentFee || 0;
  }

  async calculateNegativeProfit(affiliateId, periodStart) {
          //  console.log('Fetching calculateNegativeProfit',userIds,'startDate', startDate,"endDate", endDate);
    const previousEarnings = await AffiliateEarnings.find({
      affiliateId,
      period: { $lt: periodStart },
      netProfit: { $lt: 0 }
    });
    
    return previousEarnings.reduce((sum, earning) => sum + Math.abs(earning.netProfit), 0);
  }

  calculateNetProfit(
    totalProfitLoss,
    jackpotCost,
    totalDeduction,
    totalBonus,
    vipCashBonus,
    revenueAdjustment,
    referralCommission,
    paymentFee
  ) {
    return totalProfitLoss - 
           jackpotCost - 
           totalDeduction - 
           totalBonus - 
           vipCashBonus - 
           revenueAdjustment - 
           referralCommission - 
           paymentFee;
  }

  calculatePotentialAmount(netProfit, commissionPercent) {
    return netProfit > 0 ? (netProfit * commissionPercent / 100) : 0;
  }
}

module.exports = new AffiliateEarningsService();