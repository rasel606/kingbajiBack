const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Bonus = require('../models/Bonus');
const UserBonus = require('../models/UserBonus');

// এডভান্সড রিপোর্ট জেনারেটর
class ReportingUtils {
    
    // ড্যাশবোর্ড স্ট্যাটিস্টিক্স
    static async getDashboardStats(adminId, startDate, endDate) {
        try {
            const dateFilter = {
                datetime: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            // ট্রানজেকশন স্ট্যাটস
            const transactionStats = await Transaction.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        averageAmount: { $avg: '$amount' }
                    }
                }
            ]);

            // বোনাস স্ট্যাটস
            const bonusStats = await UserBonus.aggregate([
                { $match: { createdAt: dateFilter.createdAt } },
                {
                    $group: {
                        _id: '$bonusType',
                        totalBonus: { $sum: '$amount' },
                        activeBonus: { 
                            $sum: { 
                                $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] 
                            } 
                        },
                        completedBonus: { 
                            $sum: { 
                                $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] 
                            } 
                        }
                    }
                }
            ]);

            // ইউজার রেজিস্ট্রেশন স্ট্যাটস
            const userStats = await User.aggregate([
                { $match: { timestamp: dateFilter.datetime } },
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: { 
                            $sum: { 
                                $cond: [{ $eq: ['$isActive', true] }, 1, 0] 
                            } 
                        },
                        totalBalance: { $sum: '$balance' }
                    }
                }
            ]);

            return {
                transactionStats,
                bonusStats,
                userStats: userStats[0] || { totalUsers: 0, activeUsers: 0, totalBalance: 0 },
                dateRange: { startDate, endDate }
            };

        } catch (error) {
            throw new Error(`Reporting error: ${error.message}`);
        }
    }

    // রেফারেল পারফরম্যান্স রিপোর্ট
    static async getReferralPerformanceReport(referralCode, startDate, endDate) {
        try {
            const dateFilter = {
                datetime: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            // লেভেল 1 রেফারেল ডাটা
            const levelOneData = await Transaction.aggregate([
                {
                    $match: {
                        referredBy: referralCode,
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalDeposit: { 
                            $sum: { 
                                $cond: [{ $eq: ['$type', 0] }, '$amount', 0] 
                            } 
                        },
                        totalWithdrawal: { 
                            $sum: { 
                                $cond: [{ $eq: ['$type', 1] }, '$amount', 0] 
                            } 
                        },
                        totalBonus: { $sum: '$bonus_amount' },
                        transactionCount: { $sum: 1 }
                    }
                }
            ]);

            // লেভেল 2 এবং 3 এর জন্য রিকার্সিভ কুয়েরি
            const levelTwoThreeData = await this.getLevelTwoThreeData(referralCode, dateFilter);

            return {
                levelOne: {
                    users: levelOneData.length,
                    totalDeposit: levelOneData.reduce((sum, item) => sum + item.totalDeposit, 0),
                    totalWithdrawal: levelOneData.reduce((sum, item) => sum + item.totalWithdrawal, 0),
                    totalBonus: levelOneData.reduce((sum, item) => sum + item.totalBonus, 0),
                    details: levelOneData
                },
                ...levelTwoThreeData
            };

        } catch (error) {
            throw new Error(`Referral report error: ${error.message}`);
        }
    }

    // লেভেল 2 এবং 3 ডাটা সংগ্রহ
    static async getLevelTwoThreeData(referralCode, dateFilter) {
        // লেভেল 1 ইউজারদের খুঁজে বের করুন
        const levelOneUsers = await User.find({ referredBy: referralCode });
        const levelOneUserIds = levelOneUsers.map(user => user.userId);
        
        let levelTwoData = [];
        let levelThreeData = [];

        // লেভেল 2 ডাটা
        for (const user of levelOneUsers) {
            const levelTwoUsers = await User.find({ referredBy: user.referralCode });
            const levelTwoUserIds = levelTwoUsers.map(u => u.userId);
            
            const levelTwoTransactions = await Transaction.aggregate([
                {
                    $match: {
                        userId: { $in: levelTwoUserIds },
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalDeposit: { 
                            $sum: { 
                                $cond: [{ $eq: ['$type', 0] }, '$amount', 0] 
                            } 
                        },
                        totalWithdrawal: { 
                            $sum: { 
                                $cond: [{ $eq: ['$type', 1] }, '$amount', 0] 
                            } 
                        },
                        referredBy: { $first: '$referredBy' }
                    }
                }
            ]);

            levelTwoData = levelTwoData.concat(levelTwoTransactions);

            // লেভেল 3 ডাটা
            for (const lvl2User of levelTwoUsers) {
                const levelThreeUsers = await User.find({ referredBy: lvl2User.referralCode });
                const levelThreeUserIds = levelThreeUsers.map(u => u.userId);
                
                const levelThreeTransactions = await Transaction.aggregate([
                    {
                        $match: {
                            userId: { $in: levelThreeUserIds },
                            ...dateFilter
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            totalDeposit: { 
                                $sum: { 
                                    $cond: [{ $eq: ['$type', 0] }, '$amount', 0] 
                                } 
                            },
                            totalWithdrawal: { 
                                $sum: { 
                                    $cond: [{ $eq: ['$type', 1] }, '$amount', 0] 
                                } 
                            },
                            referredBy: { $first: '$referredBy' }
                        }
                    }
                ]);

                levelThreeData = levelThreeData.concat(levelThreeTransactions);
            }
        }

        return {
            levelTwo: {
                users: [...new Set(levelTwoData.map(item => item._id))].length,
                totalDeposit: levelTwoData.reduce((sum, item) => sum + item.totalDeposit, 0),
                totalWithdrawal: levelTwoData.reduce((sum, item) => sum + item.totalWithdrawal, 0),
                details: levelTwoData
            },
            levelThree: {
                users: [...new Set(levelThreeData.map(item => item._id))].length,
                totalDeposit: levelThreeData.reduce((sum, item) => sum + item.totalDeposit, 0),
                totalWithdrawal: levelThreeData.reduce((sum, item) => sum + item.totalWithdrawal, 0),
                details: levelThreeData
            }
        };
    }

    // ফাইন্যান্সিয়াল সুমারি রিপোর্ট
    static async getFinancialSummary(startDate, endDate) {
        try {
            const dateFilter = {
                datetime: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            const financialData = await Transaction.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            type: '$type',
                            status: '$status',
                            gateway: '$gateway_name'
                        },
                        count: { $sum: 1 },
                        totalBaseAmount: { $sum: '$base_amount' },
                        totalBonusAmount: { $sum: '$bonus_amount' },
                        totalAmount: { $sum: '$amount' },
                        averageAmount: { $avg: '$amount' }
                    }
                },
                {
                    $sort: { '_id.type': 1, '_id.status': 1 }
                }
            ]);

            return financialData;

        } catch (error) {
            throw new Error(`Financial report error: ${error.message}`);
        }
    }
}

module.exports = ReportingUtils;