// Deposit model - uses TransactionModel with type filter
const TransactionModel = require('./TransactionModel');

// Create a wrapper that filters only deposits (type: 0)
module.exports = TransactionModel;
