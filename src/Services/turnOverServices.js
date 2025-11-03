const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");

const BettingHistory = require("../Models/BettingHistory");
const UserBonus = require("../Models/UserBonus");
const User = require('../Models/User');
const Transaction = require('../Models/TransactionModel');
const Bonus = require('../Models/Bonus');




exports.checkPromotionsEligibility = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find active bonuses for user
        const userBonuses = await UserBonus.find({
            userId,
            status: { $in: ['active', 'pending'] }, // Include pending bonuses
            expiryDate: { $gt: new Date() }
        }).populate('bonusId');

        // If no active bonuses, user is eligible by default
        if (!userBonuses.length) {
            return res.status(200).json({
                message: 'No active bonuses found. User is eligible for withdrawal.',
                eligible: true,
                bonuses: []
            });
        }

        const results = [];
        let isFullyEligible = true;

        // Check each bonus's turnover requirement
        for (const bonus of userBonuses) {
            const { createdAt, expiryDate, bonusId, turnoverRequirement } = bonus;
            const eligibleGames = bonusId?.eligibleGames || [];

            // Build query for betting history
            const matchQuery = {
                member: userId,
                start_time: { $gte: createdAt },
                end_time: { $lte: expiryDate },
                status: 1 // Only count settled bets (assuming 1 means settled)
            };

            // Filter by eligible games if specified
            if (eligibleGames.length && eligibleGames[0] !== 'all') {
                matchQuery.game_id = { $in: eligibleGames };
            }

            // Calculate completed turnover
            const turnoverData = await BettingHistory.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalTurnover: { $sum: '$turnover' },
                        totalBets: { $sum: 1 } // Additional metric
                    }
                }
            ]);

            const completedTurnover = turnoverData[0]?.totalTurnover || 0;
            const isCompleted = completedTurnover >= turnoverRequirement;

            // Update the bonus status in database if completed
            if (isCompleted && bonus.status !== 'completed') {
                await UserBonus.findByIdAndUpdate(bonus._id, {
                    status: 'completed',
                    completedTurnover,
                    updatedAt: new Date()
                });
            }

            // If any bonus requirement isn't met, user isn't fully eligible
            if (!isCompleted) {
                isFullyEligible = false;
            }

            results.push({
                bonusId: bonus._id,
                bonusName: bonusId?.name || 'Unknown Bonus',
                bonusType: bonusId?.bonusType || 'unknown',
                requiredTurnover: turnoverRequirement,
                completedTurnover,
                remainingTurnover: Math.max(0, turnoverRequirement - completedTurnover),
                status: isCompleted ? 'completed' : 'incomplete',
                expiryDate: expiryDate.toISOString(),
                createdAt: bonus.createdAt.toISOString(),
                eligibleGames: eligibleGames,
                wageringRequirement: bonusId?.wageringRequirement || 1
            });
        }

        return res.status(200).json({
            message: isFullyEligible
                ? 'All bonus requirements met'
                : 'Some bonus requirements not met',
            eligible: isFullyEligible,
            bonuses: results,
            summary: {
                totalBonuses: results.length,
                completedBonuses: results.filter(b => b.status === 'completed').length,
                pendingBonuses: results.filter(b => b.status === 'incomplete').length,
                totalRequiredTurnover: results.reduce((sum, b) => sum + b.requiredTurnover, 0),
                totalCompletedTurnover: results.reduce((sum, b) => sum + b.completedTurnover, 0),
                totalRemainingTurnover: results.reduce((sum, b) => sum + b.remainingTurnover, 0)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('checkWithdrawalEligibility error:', error);

        // Differentiate between server errors and database errors
        const statusCode = error.name === 'MongoError' ? 503 : 500;

        return res.status(statusCode).json({
            message: 'Error checking withdrawal eligibility',
            error: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
            eligible: false, // Assume not eligible in case of error
            systemStatus: 'error',
            timestamp: new Date().toISOString()
        });
    }
};
















exports.checkPromotionsEligibilityActive = async (req, res) => {
    try {
        const { userId } = req.body;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const matchQuery = {
            status: { $in: ['active'] },
            updatedAt: { $gte: sevenDaysAgo },
        };

        if (userId) {
            matchQuery.userId = userId;
        }
        console.log("matchQuery", matchQuery);
        const completedBonuses = await UserBonus.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'bonus',
                    localField: 'bonusId',
                    foreignField: '_id',
                    as: 'bonusInfo'
                }
            },
            { $unwind: '$bonusInfo' },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    bonusId: 1,
                    amount: 1,
                    remainingAmount: 1,
                    turnoverRequirement: 1,
                    completedTurnover: 1,
                    status: 1,
                    expiryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    transactionId: 1,
                    'bonusInfo.name': 1,
                    'bonusInfo.bonusType': 1,
                    'bonusInfo.percentage': 1,
                    'bonusInfo.fixedAmount': 1,
                    'bonusInfo.validDays': 1,
                    'bonusInfo.eligibleGames': 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        console.log("completedBonuses", completedBonuses)
        res.status(200).json({ success: true, data: completedBonuses });
    } catch (error) {
        console.error('Error fetching completed user bonuses:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};






exports.checkPromotionsComplated = async (req, res) => {
    try {
        const { userId } = req.body;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const matchQuery = {
            status: { $in: ['completed', 'expired', 'cancelled', 'pending'] },
            updatedAt: { $gte: sevenDaysAgo }
        };

        if (userId) {
            matchQuery.userId = userId;
        }

        const completedBonuses = await UserBonus.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'bonus',
                    localField: 'bonusId',
                    foreignField: '_id',
                    as: 'bonusInfo'
                }
            },
            { $unwind: '$bonusInfo' },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    bonusId: 1,
                    amount: 1,
                    remainingAmount: 1,
                    turnoverRequirement: 1,
                    completedTurnover: 1,
                    status: 1,
                    expiryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    transactionId: 1,
                    'bonusInfo.name': 1,
                    'bonusInfo.bonusType': 1,
                    'bonusInfo.percentage': 1,
                    'bonusInfo.fixedAmount': 1,
                    'bonusInfo.validDays': 1,
                    'bonusInfo.eligibleGames': 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        console.log("completedBonuses", completedBonuses)
        res.status(200).json({ success: true, data: completedBonuses });
    } catch (error) {
        console.error('Error fetching completed user bonuses:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};