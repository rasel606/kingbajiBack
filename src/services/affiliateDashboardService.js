// const BonusService = require('./bonusService');

// // Add to the calculateDashboardData method
// async calculateDashboardData(affiliateId, userId) {
//   const {
//     currentPeriodStart,
//     currentPeriodEnd,
//     // ... other period dates
//   } = getPeriodDates();

//   const affiliate = await Affiliate.findById(affiliateId);
//   // ... existing code to get referred users

//   // Calculate all bonuses for the period
//   const bonusResults = await BonusService.calculateAllBonuses(
//     affiliateId, 
//     currentPeriodStart, 
//     currentPeriodEnd
//   );

//   // Get the complete profit/loss breakdown
//   const profitLossBreakdown = await BonusService.getProfitLossBreakdown(
//     affiliateId,
//     currentPeriodStart
//   );

//   // Prepare comprehensive dashboard data
//   return {
//     summary: {
//       // ... existing summary data
//     },
//     earnings: {
//       ggr: profitLossBreakdown.totalProfitLoss,
//       jackpotCost: profitLossBreakdown.jackpotCost,
//       deduction: profitLossBreakdown.totalDeduction,
//       turnover: profitLossBreakdown.turnover,
//       bonus: profitLossBreakdown.totalBonus,
//       recycleBalance: profitLossBreakdown.recycleBalance,
//       cancelFee: profitLossBreakdown.cancelFee,
//       vipCashBonus: profitLossBreakdown.vipCashBonus,
//       revenueAdjustment: profitLossBreakdown.revenueAdjustment,
//       referralCommission: profitLossBreakdown.referralCommission,
//       paymentFee: profitLossBreakdown.paymentFee,
//       negativeProfit: profitLossBreakdown.negativeProfit,
//       netProfit: profitLossBreakdown.netProfit,
//       commissionPercent: profitLossBreakdown.commissionPercent,
//       potentialAmount: profitLossBreakdown.potentialAmount
//     },
//     // ... other dashboard data
//   };
// }