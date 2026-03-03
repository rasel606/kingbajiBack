const moment = require('moment');

/**
 * Get date range based on date option
 * @param {string} dateOption - today, yesterday, last7days, last30days, custom
 * @param {Object} customRange - { from, to } for custom range
 * @returns {Object} { from, to }
 */
exports.getDateRange = (dateOption, customRange = {}) => {
  const now = moment();
  let from, to;

  switch (dateOption) {
    case 'today':
      from = now.startOf('day').toDate();
      to = now.endOf('day').toDate();
      break;
    case 'yesterday':
      from = now.subtract(1, 'day').startOf('day').toDate();
      to = now.endOf('day').toDate();
      break;
    case 'last7days':
      from = now.subtract(7, 'days').startOf('day').toDate();
      to = now.endOf('day').toDate();
      break;
    case 'last30days':
      from = now.subtract(30, 'days').startOf('day').toDate();
      to = now.endOf('day').toDate();
      break;
    case 'thisMonth':
      from = now.startOf('month').toDate();
      to = now.endOf('day').toDate();
      break;
    case 'lastMonth':
      from = now.subtract(1, 'month').startOf('month').toDate();
      to = now.subtract(1, 'month').endOf('month').toDate();
      break;
    case 'custom':
      if (customRange.from && customRange.to) {
        from = moment(customRange.from).startOf('day').toDate();
        to = moment(customRange.to).endOf('day').toDate();
      } else {
        // Default to last 7 days
        from = now.subtract(7, 'days').startOf('day').toDate();
        to = now.endOf('day').toDate();
      }
      break;
    default:
      // Default to last 7 days
      from = now.subtract(7, 'days').startOf('day').toDate();
      to = now.endOf('day').toDate();
  }

  return {
    from: from.toISOString(),
    to: to.toISOString()
  };
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
exports.formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

/**
 * Get date parts for grouping
 * @param {Date} date - Date to get parts from
 * @returns {Object} Date parts
 */
exports.getDateParts = (date) => {
  const m = moment(date);
  return {
    year: m.year(),
    month: m.month() + 1,
    day: m.date(),
    week: m.week(),
    quarter: m.quarter()
  };
};

/**
 * Calculate time difference in human readable format
 * @param {Date} date - Date to compare
 * @returns {string} Human readable time difference
 */
exports.timeAgo = (date) => {
  return moment(date).fromNow();
};