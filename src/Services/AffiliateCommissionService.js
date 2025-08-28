const AffiliateUserEarnings = require('../Models/AffiliateUserEarnings');
const User = require('../Models/User');
const BettingHistory = require('../Models/BettingHistory');
const UserBonus = require('../Models/UserBonus');
// const AffiliateModel = require('../models/AffiliateModel');
const AffiliateCommissionModal = require('../Models/AffiliateCommissionModal');


class AffiliateCommissionService {
  // Calculate monthly commission for all affiliates
  async calculateMonthlyCommissions() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      const affiliates = await AffiliateModel.find({ status: 'active' });
      
      for (const affiliate of affiliates) {
        await this.calculateAffiliateCommission(affiliate._id, startOfMonth, endOfMonth);
      }
      
      return { success: true, message: 'Monthly commissions calculated successfully' };
    } catch (error) {
      console.error('Error calculating monthly commissions:', error);
      throw error;
    }
  }

  // Calculate commission for a single affiliate
  async calculateAffiliateCommission(affiliateId, startDate, endDate) {
    try {
      const affiliate = await AffiliateModel.findById(affiliateId);
      if (!affiliate) throw new Error('Affiliate not found');
      
      // Get all users referred by this affiliate
      const referredUsers = await User.find({ affiliateId: affiliate._id });
      if (referredUsers.length < 5) {
        console.log(`Affiliate ${affiliate.userId} has less than 5 active players`);
        return;
      }
      
      // Calculate period (first day of the month)
      const period = new Date(startDate);
      period.setDate(1);
      
      // Check if earnings already calculated for this period
      const existingEarnings = await AffiliateUserEarnings.findOne({
        affiliateId: affiliate._id,
        period: period
      });
      
      if (existingEarnings && existingEarnings.status !== 'pending') {
        console.log(`Earnings already calculated for affiliate ${affiliate.userId} for period ${period}`);
        return;
      }
      
      // Get all betting history for referred users
      const userIds = referredUsers.map(u => u.userId);
      const bettingHistory = await BettingHistory.find({
        member: { $in: userIds },
        start_time: { $gte: startDate, $lte: endDate }
      });
      
      // Calculate total turnover, profit/loss
      let totalTurnover = 0;
      let totalProfitLoss = 0;
      
      bettingHistory.forEach(bet => {
        totalTurnover += bet.turnover || 0;
        totalProfitLoss += (bet.bet - bet.payout) || 0;
      });
      
      // Get all bonuses given to referred users
      const bonuses = await UserBonus.find({
        userId: { $in: userIds },
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Categorize bonuses
      let totalBonus = 0;
      let dailyRebate = 0;
      let weeklyBonus = 0;
      let depositBonus = 0;
      let otherBonus = 0;
      
      bonuses.forEach(bonus => {
        totalBonus += bonus.amount || 0;
        
        switch(bonus.bonusType) {
          case 'dailyRebate':
            dailyRebate += bonus.amount || 0;
            break;
          case 'weeklyLoss':
            weeklyBonus += bonus.amount || 0;
            break;
          case 'deposit':
            depositBonus += bonus.amount || 0;
            break;
          default:
            otherBonus += bonus.amount || 0;
        }
      });
      
      // Calculate net profit after bonuses
      const netProfitBeforeFees = totalProfitLoss - totalBonus;
      
      // Apply platform fee (20%)
      const platformFee = netProfitBeforeFees * (affiliate.settings.platformFee / 100);
      const netProfitAfterFees = netProfitBeforeFees - platformFee;
      
      // Calculate commission (55% of net profit after fees)
      const commission = netProfitAfterFees * (affiliate.settings.commissionRate / 100);
      
      // Check for negative profit carry forward
      let negativeCarryForward = 0;
      let status = 'calculated';
      
      if (netProfitAfterFees < 0) {
        negativeCarryForward = Math.abs(netProfitAfterFees);
        status = 'carry_forward';
      }
      
      // Create or update affiliate earnings record
      const earningsData = {
        affiliateId: affiliate._id,
        period: period,
        totalProfitLoss: totalProfitLoss,
        totalTurnover: totalTurnover,
        totalBonus: totalBonus,
        dailyRebate: dailyRebate,
        weeklyBonus: weeklyBonus,
        depositBonus: depositBonus,
        otherBonus: otherBonus,
        netProfit: netProfitAfterFees,
        platformFeePercent: affiliate.settings.platformFee,
        potentialAmount: netProfitBeforeFees,
        finalCommission: commission > 0 ? commission : 0,
        status: status,
        negativeProfit: negativeCarryForward
      };
      
      let earningsRecord;
      if (existingEarnings) {
        earningsRecord = await AffiliateUserEarnings.findByIdAndUpdate(
          existingEarnings._id,
          earningsData,
          { new: true }
        );
      } else {
        earningsRecord = await AffiliateUserEarnings.create(earningsData);
      }
      
      // Create commission record
      await AffiliateCommissionModal.create({
        affiliateId: affiliate._id,
        earningsId: earningsRecord._id,
        month: period.getMonth() + 1,
        year: period.getFullYear(),
        totalGGR: totalProfitLoss,
        totalTurnover: totalTurnover,
        totalBonus: totalBonus,
        netProfit: netProfitAfterFees,
        amount: commission > 0 ? commission : 0,
        status: status,
        activePlayers: referredUsers.length
      });
      
      // Update affiliate's total commission if commission is positive
      if (commission > 0) {
        await AffiliateModel.findByIdAndUpdate(affiliate._id, {
          $inc: {
            totalCommission: commission,
            availableBalance: commission
          }
        });
      }
      
      return earningsRecord;
    } catch (error) {
      console.error(`Error calculating commission for affiliate ${affiliateId}:`, error);
      throw error;
    }
  }
  
  // Process commission payments (run between 5th-10th of each month)
  async processCommissionPayments() {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      // Find all earnings that are calculated but not paid
      const earningsToPay = await AffiliateUserEarnings.find({
        period: lastMonth,
        status: 'calculated',
        finalCommission: { $gt: 0 }
      });
      
      for (const earning of earningsToPay) {
        await this.processSingleCommissionPayment(earning._id);
      }
      
      return { success: true, message: 'Commission payments processed successfully' };
    } catch (error) {
      console.error('Error processing commission payments:', error);
      throw error;
    }
  }
  
  // Process payment for a single commission
  async processSingleCommissionPayment(earningsId) {
    try {
      const earning = await AffiliateUserEarnings.findById(earningsId);
      if (!earning) throw new Error('Earnings record not found');
      
      if (earning.status !== 'calculated' || earning.finalCommission <= 0) {
        throw new Error('Invalid earnings record for payment');
      }
      
      // Update earnings status to paid
      earning.status = 'paid';
      earning.paidDate = new Date();
      await earning.save();
      
      // Update commission record
      await AffiliateCommissionModal.updateMany(
        { earningsId: earning._id },
        { $set: { status: 'paid' } }
      );
      
      return earning;
    } catch (error) {
      console.error(`Error processing payment for earnings ${earningsId}:`, error);
      throw error;
    }
  }
}

module.exports = new AffiliateCommissionService();