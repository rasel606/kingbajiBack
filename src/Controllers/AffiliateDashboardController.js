const Affiliate = require('../Models/AffiliateModel');
const AffiliateEarnings = require('../Models/AffiliateUserEarnings');
const User = require('../Models/User'); 
const BettingHistory = require('../Models/BettingHistory');
const TransactionModel = require('../Models/TransactionModel');
const UserBonus = require('../Models/UserBonus');
const moment = require('moment');
const { getPeriodDates } = require('../Utils/periodUtils');
const catchAsync = require('../Utils/catchAsync');
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

// Helper function for turnover aggregation
const getTurnoverStats = async (referredUserIds, startDate, endDate = null) => {
  const matchStage = {
    member: { $in: referredUserIds },
    start_time: { $gte: startDate }
  };
  
  if (endDate) {
    matchStage.start_time.$lt = endDate;
  }

  const result = await BettingHistory.aggregate([
    {
      $match: matchStage
    },
    {
      $group: {
        _id: '$member',
        userTurnover: { $sum: '$turnover' }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: { $cond: [{ $gt: ['$userTurnover', 0] }, 1, 0] } },
        amount: { $sum: '$userTurnover' }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { count: 0, amount: 0 };
};

// Get dashboard data for affiliate
exports.getAffiliateDashboard = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  console.log('Fetching dashboard for affiliate userId:', userId);
  // Input validation
  if (!userId) {
    return next(new AppError('Valid user ID is required', 400));
  }
  
  const {
    currentPeriodStart,
    currentPeriodEnd,
    lastPeriodStart,
    lastPeriodEnd,
    todayStart,
    todayEnd,
    yesterdayStart,
    yesterdayEnd,
    startOfWeek,
    startOfLastWeek,
    endOfLastWeek
  } = getPeriodDates();
  
  try {
    // Get affiliate data
    const affiliate = await Affiliate.findOne({ userId: userId });
    console.log('Affiliate data:', affiliate);
    if (!affiliate) {
      return next(new AppError('Affiliate not found', 404));
    }
    
    // Get referred users
    const referredUsers = await User.find({ referredBy: affiliate.referralCode });
    const referredUserIds = referredUsers.map(u => u.userId);
    
    // Execute all queries in parallel for better performance
    const [
      currentEarnings,
      lastEarnings,
      activePlayersCurrent,
      activePlayersLast,
      registrationStats,
      firstDeposits,
      turnoverStats,
      depositStats,
      withdrawalStats,
      bonusStats,
      totalTurnoverStats,
      bonusDeductions
    ] = await Promise.all([
      // Earnings data
      AffiliateEarnings.findOne({
        affiliateId: affiliate.userId,
        period: currentPeriodStart
      }),
      AffiliateEarnings.findOne({
        affiliateId: affiliate.userId,
        period: lastPeriodStart
      }),
      
      // Active players (current period) - users with at least 1000 turnover
      BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            start_time: { $gte: currentPeriodStart, $lt: currentPeriodEnd }
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
      
      // Active players (last period) - users with at least 1000 turnover
      BettingHistory.aggregate([
        {
          $match: {
            member: { $in: referredUserIds },
            start_time: { $gte: lastPeriodStart, $lt: lastPeriodEnd }
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
          timestamp: { $gte: todayStart, $lt: todayEnd } 
        });
        
        const yesterday = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: yesterdayStart, $lt: yesterdayEnd } 
        });
        
        const thisWeek = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: startOfWeek } 
        });
        
        const lastWeek = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: startOfLastWeek, $lt: startOfWeek } 
        });
        
        const thisMonth = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: currentPeriodStart, $lt: currentPeriodEnd } 
        });
        
        const lastMonth = await User.countDocuments({ 
          referredBy: affiliate.referralCode, 
          timestamp: { $gte: lastPeriodStart, $lt: lastPeriodEnd } 
        });
        
        return { today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth };
      })(),
      
      // First deposit stats
      (async () => {
        // Find first deposits by getting the earliest deposit for each user
        const firstDeposits = await TransactionModel.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              type: 0, // Deposit type
              status: 1 // Accepted status
            }
          },
          {
            $group: {
              _id: '$userId',
              firstDepositDate: { $min: '$datetime' },
              firstDepositAmount: { $first: '$base_amount' }
            }
          }
        ]);
        
        // Count first deposits by period
        const today = firstDeposits.filter(d => 
          d.firstDepositDate >= todayStart && d.firstDepositDate < todayEnd
        );
        
        const yesterday = firstDeposits.filter(d => 
          d.firstDepositDate >= yesterdayStart && d.firstDepositDate < yesterdayEnd
        );
        
        const thisWeek = firstDeposits.filter(d => 
          d.firstDepositDate >= startOfWeek
        );
        
        const lastWeek = firstDeposits.filter(d => 
          d.firstDepositDate >= startOfLastWeek && d.firstDepositDate < startOfWeek
        );
        
        const thisMonth = firstDeposits.filter(d => 
          d.firstDepositDate >= currentPeriodStart && d.firstDepositDate < currentPeriodEnd
        );
        
        const lastMonth = firstDeposits.filter(d => 
          d.firstDepositDate >= lastPeriodStart && d.firstDepositDate < lastPeriodEnd
        );
        
        return {
          today: { 
            count: today.length, 
            amount: today.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          },
          yesterday: { 
            count: yesterday.length, 
            amount: yesterday.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          },
          thisWeek: { 
            count: thisWeek.length, 
            amount: thisWeek.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          },
          lastWeek: { 
            count: lastWeek.length, 
            amount: lastWeek.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          },
          thisMonth: { 
            count: thisMonth.length, 
            amount: thisMonth.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          },
          lastMonth: { 
            count: lastMonth.length, 
            amount: lastMonth.reduce((sum, d) => sum + d.firstDepositAmount, 0) 
          }
        };
      })(),
      
      // Turnover stats
      (async () => {
        const [
          today,
          yesterday,
          thisWeek,
          lastWeek,
          thisMonth,
          lastMonth
        ] = await Promise.all([
          getTurnoverStats(referredUserIds, todayStart, todayEnd),
          getTurnoverStats(referredUserIds, yesterdayStart, yesterdayEnd),
          getTurnoverStats(referredUserIds, startOfWeek),
          getTurnoverStats(referredUserIds, startOfLastWeek, startOfWeek),
          getTurnoverStats(referredUserIds, currentPeriodStart, currentPeriodEnd),
          getTurnoverStats(referredUserIds, lastPeriodStart, lastPeriodEnd)
        ]);

        return {
          today,
          yesterday,
          thisWeek,
          lastWeek,
          thisMonth,
          lastMonth
        };
      })(),
      
      // Deposit stats (current period)
      (async () => {
        const deposits = await TransactionModel.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              type: 0, // Deposit type
              status: 1, // Accepted status
              datetime: { $gte: currentPeriodStart, $lt: currentPeriodEnd }
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
      
      // Withdrawal stats (current period)
      (async () => {
        const withdrawals = await TransactionModel.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              type: 1, // Withdrawal type
              status: 1, // Accepted status
              datetime: { $gte: currentPeriodStart, $lt: currentPeriodEnd }
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
        
        return withdrawals.length > 0 ? withdrawals[0] : { count: 0, amount: 0 };
      })(),
      
      // Bonus stats (current period)
      (async () => {
        const bonuses = await UserBonus.aggregate([
          {
            $match: {
              userId: { $in: referredUserIds },
              createdAt: { $gte: currentPeriodStart, $lt: currentPeriodEnd }
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
      
      // Total turnover stats (current period)
      (async () => {
        const turnover = await BettingHistory.aggregate([
          {
            $match: {
              member: { $in: referredUserIds },
              start_time: { $gte: currentPeriodStart, $lt: currentPeriodEnd }
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
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
        totalTurnover: totalTurnoverStats,
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
      turnovers: turnoverStats,
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

// Get detailed player statistics
exports.getPlayerStats = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  
  if (!userId) {
    return next(new AppError('Valid user ID is required', 400));
  }
  
  const affiliate = await Affiliate.findOne({ userId: userId });
  if (!affiliate) {
    return next(new AppError('Affiliate not found', 404));
  }
  
  try {
    // Get referred users with their details
    const referredUsers = await User.find({ referredBy: affiliate.referralCode });
    const referredUserIds = referredUsers.map(u => u.userId);
    
    // Get additional stats for each player
    const playerStats = await Promise.all(
      referredUsers.map(async (user) => {
        const [deposits, withdrawals, turnover, bonuses] = await Promise.all([
          // Total deposits
          TransactionModel.aggregate([
            {
              $match: {
                userId: user.userId,
                type: 0,
                status: 1
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$base_amount' }
              }
            }
          ]),
          
          // Total withdrawals
          TransactionModel.aggregate([
            {
              $match: {
                userId: user.userId,
                type: 1,
                status: 1
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$base_amount' }
              }
            }
          ]),
          
          // Total turnover
          BettingHistory.aggregate([
            {
              $match: {
                member: user.userId
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$turnover' }
              }
            }
          ]),
          
          // Total bonuses
          UserBonus.aggregate([
            {
              $match: {
                userId: user.userId
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' }
              }
            }
          ])
        ]);
        
        return {
          userId: user.userId,
          username: user.username,
          email: user.email,
          registrationDate: user.timestamp,
          totalDeposits: deposits[0]?.total || 0,
          totalWithdrawals: withdrawals[0]?.total || 0,
          totalTurnover: turnover[0]?.total || 0,
          totalBonuses: bonuses[0]?.total || 0,
          netRevenue: (deposits[0]?.total || 0) - (withdrawals[0]?.total || 0)
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: playerStats
    });
    
  } catch (error) {
    console.error('Error in getPlayerStats:', error);
    return next(new AppError('Internal server error', 500));
  }
});

// Get commission history
exports.getCommissionHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { page = 1, limit = 10 } = req.query;
  
  if (!userId) {
    return next(new AppError('Valid user ID is required', 400));
  }
  
  const affiliate = await Affiliate.findOne({ userId: userId });
  if (!affiliate) {
    return next(new AppError('Affiliate not found', 404));
  }
  
  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { period: -1 }
    };
    
    // Using aggregate to get paginated results with total count
    const commissionHistory = await AffiliateEarnings.aggregate([
      { $match: { affiliateId: affiliate._id } },
      { $sort: { period: -1 } },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: (options.page - 1) * options.limit }, { $limit: options.limit }]
        }
      }
    ]);
    
    const totalCount = commissionHistory[0].metadata[0]?.totalCount || 0;
    const commissions = commissionHistory[0].data;
    
    res.status(200).json({
      success: true,
      data: commissions,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / options.limit)
      }
    });
    
  } catch (error) {
    console.error('Error in getCommissionHistory:', error);
    return next(new AppError('Internal server error', 500));
  }
});

// Helper function to get period dates
// function getPeriodDates() {
//   const now = new Date();
  
//   // Use UTC dates for consistency
//   const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
//   const lastPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  
//   // Today in UTC
//   const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
//   const todayEnd = new Date(todayStart);
//   todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
  
//   // Yesterday in UTC
//   const yesterdayStart = new Date(todayStart);
//   yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
//   const yesterdayEnd = new Date(todayStart);
  
//   // Week calculations in UTC
//   const startOfWeek = new Date(now);
//   startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
//   startOfWeek.setUTCHours(0, 0, 0, 0);
  
//   const startOfLastWeek = new Date(startOfWeek);
//   startOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 7);
  
//   const endOfLastWeek = new Date(startOfWeek);
//   endOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 1);
//   endOfLastWeek.setUTCHours(23, 59, 59, 999);
  
//   // Month calculations
//   const nextMonthStart = new Date(currentPeriodStart);
//   nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);
  
//   return {
//     currentPeriodStart,
//     currentPeriodEnd: nextMonthStart,
//     lastPeriodStart,
//     lastPeriodEnd: currentPeriodStart,
//     todayStart,
//     todayEnd,
//     yesterdayStart,
//     yesterdayEnd,
//     startOfWeek,
//     startOfLastWeek,
//     endOfLastWeek
//   };
// }