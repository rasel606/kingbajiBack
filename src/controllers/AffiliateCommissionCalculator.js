// utils/commissionCalculator.js
const AffiliateUser = require('../Models/AffiliateUser');
const BettingHistory = require('../Models/BettingHistory');
const Transaction = require('../Models/Transaction');

const calculateCommission = async (affiliateId, startDate, endDate) => {
  try {
    // Get affiliate details
    const affiliate = await AffiliateUser.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Get all downline users
    const downlineUsers = affiliate.AffiliatereferralOfUser;

    // Calculate total net profit from downline users
    let totalNetProfit = 0;
    let totalTurnover = 0;
    let activePlayers = 0;

    for (const userId of downlineUsers) {
      // Get betting history for the period
      const bets = await BettingHistory.find({
        member: userId,
        start_time: { $gte: startDate, $lte: endDate }
      });

      // Calculate player stats
      const playerStats = bets.reduce((acc, bet) => {
        acc.turnover += bet.turnover;
        acc.profitLoss += (bet.bet - bet.payout);
        return acc;
      }, { turnover: 0, profitLoss: 0 });

      // Only consider active players (minimum 5 bets)
      if (bets.length >= 5) {
        activePlayers++;
        totalTurnover += playerStats.turnover;
        totalNetProfit += playerStats.profitLoss;
      }
    }

    // Apply platform fee (20%)
    const afterPlatformFee = totalNetProfit * 0.8;

    // Calculate commission (55% of net profit after fees)
    const commission = afterPlatformFee * 0.55;

    // Check if minimum 5 active players requirement is met
    const isCommissionEligible = activePlayers >= 5;

    return {
      totalNetProfit,
      totalTurnover,
      activePlayers,
      afterPlatformFee,
      commission: isCommissionEligible ? commission : 0,
      isCommissionEligible,
      commissionRate: 0.55,
      platformFeeRate: 0.2
    };
  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
};

module.exports = { calculateCommission };