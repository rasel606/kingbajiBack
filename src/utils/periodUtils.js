// utils/periodUtils.js
// function getPeriodDates() {
//   const now = new Date();
//     const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
//   // const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  

 

//   // Use UTC dates for consistency
//   // const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
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
function getPeriodDates() {
  const now = new Date();
  
  // Use UTC dates for consistency
  const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  
  // Today in UTC
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
  
  // Yesterday in UTC
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const yesterdayEnd = new Date(todayStart);
  
  // Week calculations in UTC
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 7);
  
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setUTCDate(startOfWeek.getUTCDate() - 1);
  endOfLastWeek.setUTCHours(23, 59, 59, 999);
  
  // Month calculations
  const nextMonthStart = new Date(currentPeriodStart);
  nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);
  
  return {
    currentPeriodStart,
    currentPeriodEnd: nextMonthStart,
    lastPeriodStart,
    lastPeriodEnd: currentPeriodStart,
    todayStart,
    todayEnd,
    yesterdayStart,
    yesterdayEnd,
    startOfWeek,
    startOfLastWeek,
    endOfLastWeek
  };
}
// Helper function for turnover aggregation
const getTurnoverStats = async (BettingHistory, referredUserIds, startDate, endDate = null) => {
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

module.exports = {
  getPeriodDates,
  getTurnoverStats
};