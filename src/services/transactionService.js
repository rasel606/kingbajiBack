const TransactionModel = require('../Models/TransactionModel');

// Function to search for deposits
exports.searchDeposits = async (req, res) => {
    const { page = 1, limit = 10, userId, transactionID, gateway_name, status, startDate, endDate } = req.query;

    const filters = { type: 0 }; // 0 for deposits

    if (userId) filters.userId = userId;
    if (transactionID) filters.transactionID = transactionID;
    if (gateway_name) filters.gateway_name = gateway_name;
    if (status) filters.status = status;
    if (startDate || endDate) {
        filters.datetime = {};
        if (startDate) filters.datetime.$gte = new Date(startDate);
        if (endDate) filters.datetime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const deposits = await TransactionModel.find(filters)
        .sort({ datetime: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(deposits);
};

// Function to search for withdrawals
exports.searchWithdrawals = async (req, res) => {
    const { page = 1, limit = 10, userId, transactionID, gateway_name, status, startDate, endDate } = req.query;

    const filters = { type: 1 }; // 1 for withdrawals

    if (userId) filters.userId = userId;
    if (transactionID) filters.transactionID = transactionID;
    if (gateway_name) filters.gateway_name = gateway_name;
    if (status) filters.status = status;
    if (startDate || endDate) {
        filters.datetime = {};
        if (startDate) filters.datetime.$gte = new Date(startDate);
        if (endDate) filters.datetime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const withdrawals = await TransactionModel.find(filters)
        .sort({ datetime: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(withdrawals);
};