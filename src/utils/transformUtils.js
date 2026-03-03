const moment = require('moment');

/**
 * Transform betting records for frontend consumption
 * @param {Array} records - Raw betting records
 * @returns {Array} Transformed records grouped by date
 */
exports.transformBettingRecords = (records) => {
  if (!records || !Array.isArray(records)) {
    return [];
  }

  // Group by date
  const groupedByDate = {};
  
  records.forEach(record => {
    if (!record.start_time) return;
    
    const dateKey = moment(record.start_time).format('YYYY-MM-DD');
    
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: dateKey,
        records: [],
        totals: {
          turnover: 0,
          bet: 0,
          payout: 0,
          profitLoss: 0,
          count: 0
        }
      };
    }
    
    const transformedRecord = {
      _id: record._id || record.id || record.ref_no,
      id: record.id,
      ref_no: record.ref_no,
      platform: record.platform || record.product,
      gameType: record.gameType || record.category || 'Unknown',
      game_id: record.game_id,
      start_time: record.start_time,
      turnover: record.turnover || 0,
      bet: record.bet || 0,
      payout: record.payout || 0,
      profitLoss: record.profitLoss || 0,
      status: record.status,
      settlement_status: record.settlement_status,
      currency: record.currency || 'USD',
      provider_code: record.product
    };
    
    groupedByDate[dateKey].records.push(transformedRecord);
    
    // Update totals
    groupedByDate[dateKey].totals.turnover += transformedRecord.turnover;
    groupedByDate[dateKey].totals.bet += transformedRecord.bet;
    groupedByDate[dateKey].totals.payout += transformedRecord.payout;
    groupedByDate[dateKey].totals.profitLoss += transformedRecord.profitLoss;
    groupedByDate[dateKey].totals.count++;
  });
  
  // Convert to array and sort by date descending
  const result = Object.values(groupedByDate)
    .map(group => ({
      ...group,
      records: group.records.sort((a, b) => 
        new Date(b.start_time) - new Date(a.start_time)
      )
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return result;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
exports.formatCurrency = (amount, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount || 0);
};

/**
 * Transform game data for frontend
 * @param {Array} games - Raw game data
 * @returns {Array} Transformed game data
 */
exports.transformGames = (games) => {
  return games.map(game => ({
    g_code: game.g_code,
    g_type: game.g_type,
    p_code: game.p_code,
    gameName: game.gameName,
    displayName: game.gameName?.gameName_enus || game.gameName?.gameName_zhcn || game.gameName?.gameName_zhtw || game.g_code,
    imgFileName: game.imgFileName,
    category_name: game.category_name,
    serial_number: game.serial_number,
    is_hot: game.is_hot,
    is_featured: game.is_featured,
    is_new: game.is_new,
    popularity: game.popularity,
    min_bet: game.min_bet,
    max_bet: game.max_bet,
    rtp: game.rtp,
    provider: game.game_provider
  }));
};