// const AffiliateModel = require('../Models/AffiliateModel');
// const AffiliateEarnings = require('../Models/AffiliateUserEarnings');
// const User = require('../Models/User');
// const Transaction = require('../Models/TransactionModel');
// const BettingHistory = require('../Models/BettingHistory');
// const moment = require('moment');
const AffiliateModel = require('../Models/AffiliateModel');
const AffiliateEarnings = require('../Models/AffiliateUserEarnings');
const User = require('../Models/User');
const Transaction = require('../Models/TransactionModel');
const BettingHistory = require('../Models/BettingHistory');
const UserBonus = require('../Models/UserBonus');
const moment = require('moment');
const mongoose = require('mongoose');

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const getPeriodDates = () => {
  const now = new Date();
  
  // Use UTC dates for consistency
  const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  
  // Today in UTC
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  // Yesterday in UTC
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  
  // Week calculations in UTC
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 7);
  
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 1);
  
  return {
    currentPeriodStart,
    lastPeriodStart,
    todayStart,
    yesterdayStart,
    startOfWeek,
    startOfLastWeek,
    endOfLastWeek
  };
};

// Get dashboard data for affiliate
exports.getAffiliateDashboard = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  
  // Input validation
  if (!userId) {
    return next(new AppError('Valid user ID is required', 400));
  }
  
  const {
    currentPeriodStart,
    lastPeriodStart,
    todayStart,
    yesterdayStart,
    startOfWeek,
    startOfLastWeek,
    endOfLastWeek
  } = getPeriodDates();
  
  try {
    // Get affiliate data
    const affiliate = await AffiliateModel.findOne({ userId: userId });
    if (!affiliate) {
      return next(new AppError('Affiliate not found', 404));
    }
    
    // Get referred users
    const referredUsers = await User.find({ referredBy: affiliate.referralCode });
    const referredUserIds = referredUsers.map(u => u.userId);
    console.log("referredUserIds", referredUserIds);
    console.log("referredUsers", referredUsers);
    // Execute all queries in parallel for better performance
    const [
      currentEarnings,
      lastEarnings,
      activePlayersCurrent,
      activePlayersLast,
      registrationStats,
      firstDeposits,
      depositStats,
      withdrawalStats,
      bonusStats,
      turnoverStats,
      bonusDeductions
    ] = await Promise.all([
      // Earnings data
      AffiliateEarnings.findOne({
        affiliateId: affiliate._id,
        period: currentPeriodStart
      }),
      AffiliateEarnings.findOne({
        affiliateId: affiliate._id,
        period: lastPeriodStart
      }),
      
      // Active players (current period)
      BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            start_time: { $gte: currentPeriodStart }
          }
        },
        {
          $group: {
            _id: '$member',
            totalTurnover: { $sum: '$turnover' }
          }
        },
        {
          $match: {
            totalTurnover: { $gte: 1000 }
          }
        },
        {
          $count: 'activePlayers'
        }
      ]),
      
      // Active players (last period)
      BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            start_time: { $gte: lastPeriodStart, $lt: currentPeriodStart }
          }
        },
        {
          $group: {
            _id: '$member',
            totalTurnover: { $sum: '$turnover' }
          }
        },
        {
          $match: {
            totalTurnover: { $gte: 1000 }
          }
        },
        {
          $count: 'activePlayers'
        }
      ]),
      
      // Registration stats
      (async () => {
        const today = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: todayStart } 
        });
        console.log("today", today);
        const yesterday = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: yesterdayStart, $lt: todayStart } 
        });
        
        const thisWeek = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: startOfWeek } 
        });
        
        const lastWeek = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } 
        });
        
        const thisMonth = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: currentPeriodStart } 
        });
        
        const lastMonth = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: lastPeriodStart, $lt: currentPeriodStart } 
        });
        console.log("lastMonth",  thisWeek);
        return { today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth };
      })(),
      
      // First deposit stats (placeholder)
      Promise.resolve({
        today: { count: 0, amount: 0 },
        yesterday: { count: 0, amount: 0 },
        thisWeek: { count: 0, amount: 0 },
        lastWeek: { count: 0, amount: 0 },
        thisMonth: { count: 0, amount: 0 },
        lastMonth: { count: 0, amount: 0 }
      }),
      
      // Deposit stats
      (async () => {
        const deposits = await Transaction.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              type: 0, // Deposit type
              status: 1, // Accepted status
              datetime: { $gte: currentPeriodStart }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$base_amount' }
            }
          }
        ]);
        
        return deposits.length > 0 ? deposits[0] : { count: 0, amount: 0 };
      })(),
      
      // Withdrawal stats
      (async () => {
        const withdrawals = await Transaction.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              type: 1, // Withdrawal type
              status: 1, // Accepted status
              datetime: { $gte: currentPeriodStart }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$base_amount' }
            }
          }
        ]);
        console.log("withdrawals", withdrawals);
        return withdrawals.length > 0 ? withdrawals[0] : { count: 0, amount: 0 };
      })(),
      
      // Bonus stats
      (async () => {
        const bonuses = await UserBonus.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              createdAt: { $gte: currentPeriodStart }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$amount' }
            }
          }
        ]);
        
        return bonuses.length > 0 ? bonuses[0] : { count: 0, amount: 0 };
      })(),
      
      // Turnover stats
      (async () => {
        const turnover = await BettingHistory.aggregate([
          {
            $match: {
              member: { $in: referredUserIds },
              start_time: { $gte: currentPeriodStart }
            }
          },
          {
            $group: {
              _id: null,
              totalTurnover: { $sum: '$turnover' }
            }
          }
        ]);
        
        return turnover.length > 0 ? turnover[0].totalTurnover : 0;
      })(),
      
      // Bonus deductions (from affiliate earnings)
      (async () => {
        const earnings = await AffiliateEarnings.findOne({
          affiliateId: affiliate._id,
          period: currentPeriodStart
        });
        return earnings ? earnings.totalBonus || 0 : 0;
      })()
    ]);
    
    console.log("stats",  currentPeriodStart
      );
    // Prepare comprehensive dashboard data
    const dashboardData = {
      summary: {
        commission: {
          thisPeriod: currentEarnings?.finalCommission || 0,
          lastPeriod: lastEarnings?.finalCommission || 0
        },
        activePlayers: {
          thisPeriod: activePlayersCurrent[0]?.activePlayers || 0,
          lastPeriod: activePlayersLast[0]?.activePlayers || 0
        },
        
        totalPlayers: referredUsers.length,
        totalTurnover: turnoverStats,
        bonusDeductions: bonusDeductions
      },
      // Match frontend expected structure
      
      commission: {
        thisPeriod: currentEarnings?.finalCommission || 0,
        lastPeriod: lastEarnings?.finalCommission || 0
      },
      activePlayers: {
        thisPeriod: activePlayersCurrent[0]?.activePlayers || 0,
        lastPeriod: activePlayersLast[0]?.activePlayers || 0
      },
      registeredUsers: {
        today: registrationStats.today,
        yesterday: registrationStats.yesterday,
        thisWeek: registrationStats.thisWeek,
        lastWeek: registrationStats.lastWeek,
        thisMonth: registrationStats.thisMonth,
        lastMonth: registrationStats.lastMonth
      },
      firstDeposits: firstDeposits,
      deposits: {
        count: depositStats.count,
        amount: depositStats.amount
      },
      withdrawals: {
        count: withdrawalStats.count,
        amount: withdrawalStats.amount
      },
      bonuses: {
        count: bonusStats.count,
        amount: bonusStats.amount
      },
      // Add empty objects for other expected sections
      recycleAmounts: { count: 0, amount: 0 },
      cancelFees: { count: 0, amount: 0 },
      vipCashBonuses: { count: 0, amount: 0 },
      referralCommissions: { count: 0, amount: 0 },
      turnovers: { count: 0, amount: 0 },
      profitLoss: { count: 0, amount: 0 }
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error in getAffiliateDashboard:', error);
    return next(new AppError('Internal server error', 500));
  }
});
