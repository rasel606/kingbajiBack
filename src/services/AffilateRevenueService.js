const BettingHistory = require('../models/BettingHistory');
const User = require('../models/User');
const Affiliate = require('../models/AffiliateModel');
const { getPeriodDates } = require('../utils/periodUtils');
const redisClient = require('../utils/redisClient');
const AffiliateEarningsService = require('./AffiliateEarningsService');

// Cache configuration
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes in seconds
const REFERRED_USERS_TTL = parseInt(process.env.REFERRED_USERS_TTL) || 1800; // 30 minutes in seconds

class AffiliateRevenueService {
  async calculateRevenueByGameType(affiliateId, currency) {
    try {
      const cacheKey = redisClient.generateRevenueKey(affiliateId, currency);
      
      // Check for cached data
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached revenue data for affiliate:', affiliateId);
        return { ...cachedData, fromCache: true };
      }

      console.log('Calculating fresh revenue data for affiliate:', affiliateId);
      
      const affiliate = await Affiliate.findOne({ userId: affiliateId });
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Get referred users (using the cached method from earnings service)
      const referredUsers = await AffiliateEarningsService.getReferredUsers(affiliate.referralCode, affiliateId);
      const referredUserIds = referredUsers.map(u => u.userId);

      const {
        currentPeriodStart,
        currentPeriodEnd
      } = getPeriodDates();

      // Calculate profit/loss by game type
      const profitLossByGameType = await BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            currency: currency,
            // start_time: { $gte: currentPeriodStart, $lte: currentPeriodEnd }
          }
        },
        {
          $group: {
            _id: '$gameType',
            totalProfitLoss: { $sum: { $subtract: ['$bet', '$payout'] } }
          }
        },
        {
          $project: {
            gameType: '$_id',
            profitLoss: '$totalProfitLoss',
            _id: 0
          }
        }
      ]);

      // Calculate turnover by game type
      const turnoverByGameType = await BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            currency: currency,
            start_time: { $gte: currentPeriodStart, $lte: currentPeriodEnd }
          }
        },
        {
          $group: {
            _id: '$gameType',
            totalTurnover: { $sum: '$turnover' }
          }
        },
        {
          $project: {
            gameType: '$_id',
            turnover: '$totalTurnover',
            _id: 0
          }
        }
      ]);

      // Calculate total profit/loss
      const totalProfitLossResult = await BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            currency: currency,
            start_time: { $gte: currentPeriodStart, $lte: currentPeriodEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalProfitLoss: { $sum: { $subtract: ['$bet', '$payout'] } }
          }
        }
      ]);

      const totalProfitLoss = totalProfitLossResult[0]?.totalProfitLoss || 0;

      // Calculate cock fighting revenue (if applicable)
      const cockFightingRevenueResult = await BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            currency: currency,
            start_time: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
            gameType: 'CockFighting'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $subtract: ['$bet', '$payout'] } }
          }
        }
      ]);

      const cockFightingRevenue = cockFightingRevenueResult[0]?.totalRevenue || 0;

      const revenueData = {
        profitLossByGameType,
        turnoverByGameType,
        totalProfitLoss,
        cockFightingRevenue,
        totalRevenue: totalProfitLoss + cockFightingRevenue,
        lastUpdated: new Date(),
        fromCache: false
      };

      // Cache the results (don't await, let it happen in background)
      redisClient.set(cacheKey, revenueData, CACHE_TTL).catch(err => {
        console.error('Background caching of revenue data failed:', err);
      });

      return revenueData;
    } catch (error) {
      console.error('Error calculating revenue by game type:', error);
      throw error;
    }
  }

  async invalidateRevenueCache(affiliateId, currency = null) {
    try {
      if (currency) {
        // Invalidate specific currency cache
        const cacheKey = redisClient.generateRevenueKey(affiliateId, currency);
        await redisClient.del(cacheKey);
        console.log('Invalidated revenue cache for affiliate:', affiliateId, 'currency:', currency);
      } else {
        // Invalidate all currency caches for this affiliate
        const currencies = ['BDT', 'USD', 'EUR', 'GBP']; // Add all supported currencies
        for (const curr of currencies) {
          const cacheKey = redisClient.generateRevenueKey(affiliateId, curr);
          await redisClient.del(cacheKey);
        }
        console.log('Invalidated all revenue caches for affiliate:', affiliateId);
      }
      
      return true;
    } catch (error) {
      console.error('Error invalidating revenue cache:', error);
      return false;
    }
  }
}

module.exports = new AffiliateRevenueService();