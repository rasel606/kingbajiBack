'use strict';

const { executeTransaction } = require('../utilities/transactionUtility');

const processTransaction = async (transactionData) => {
    try {
        // Corrected transaction type handling
        if (transactionData.type === 'withdrawal') {
            // Implement withdrawal approval
            await approveWithdrawal(transactionData);
        } else if (transactionData.type === 'deposit') {
            // Handle deposit logic
            await executeTransaction(transactionData);
        } else {
            throw new Error('Invalid transaction type');
        }
    } catch (error) {
        // Handle error appropriately
        console.error('Transaction processing error:', error);
        throw error;
    }
};

const approveWithdrawal = async (transactionData) => {
    // Logic for approving the withdrawal
    //...
};

module.exports = { processTransaction };