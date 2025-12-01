const User = require('../Models/User');
const Agent = require('../Models/AgentModel');
const SubAgent = require('../Models/SubAgentModel');
const Transaction = require('../Models/TransactionModel');
const { ObjectId } = require('mongodb');


exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.UserId;
        const userRole = req.user.role;

        // Get date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Base query based on user role
        let userQuery = {};
        let transactionQuery = {};

        if (userRole === 'Agent') {
            userQuery = { referredBy: req.user.referralCode };
            transactionQuery = { referredBy: req.user.referralCode };
        } else if (userRole === 'SubAgent') {
            userQuery = { referredBy: req.user.referralCode };
            transactionQuery = { referredBy: req.user.referralCode };
        }

        // Fetch all data first, then calculate growth
        const [
            totalUsers,
            onlineUsers,
            thisMonthNewUsers,
            lastMonthNewUsers,
            totalDepositResult,
            totalWithdrawResult,
            totalBalanceResult,
            thisMonthDepositsResult,
            lastMonthDepositsResult,
            thisMonthWithdrawsResult,
            lastMonthWithdrawsResult,
            thisMonthBetting,
            lastMonthBetting
        ] = await Promise.all([
            // User statistics
            User.countDocuments(userQuery),
            User.countDocuments({ ...userQuery, status: 'online' }),
            User.countDocuments({
                ...userQuery,
                createdAt: { $gte: startOfMonth }
            }),
            User.countDocuments({
                ...userQuery,
                createdAt: {
                    $gte: startOfLastMonth,
                    $lte: endOfLastMonth
                }
            }),

            // Transaction totals
            Transaction.aggregate([
                { $match: { ...transactionQuery, type: 0, status: 1 } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { ...transactionQuery, type: 1, status: 1 } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.aggregate([
                { $match: userQuery },
                { $group: { _id: null, total: { $sum: '$balance' } } }
            ]),

            // Monthly deposits
            Transaction.aggregate([
                {
                    $match: {
                        ...transactionQuery,
                        type: 0,
                        status: 1,
                        createdAt: { $gte: startOfMonth }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        ...transactionQuery,
                        type: 0,
                        status: 1,
                        createdAt: {
                            $gte: startOfLastMonth,
                            $lte: endOfLastMonth
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Monthly withdrawals
            Transaction.aggregate([
                {
                    $match: {
                        ...transactionQuery,
                        type: 1,
                        status: 1,
                        createdAt: { $gte: startOfMonth }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        ...transactionQuery,
                        type: 1,
                        status: 1,
                        createdAt: {
                            $gte: startOfLastMonth,
                            $lte: endOfLastMonth
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Betting statistics (placeholder - replace with your betting model)
            Promise.resolve(0), // thisMonthBetting
            Promise.resolve(0), // lastMonthBetting
        ]);

        // Extract values from aggregation results
        const totalDeposit = totalDepositResult[0]?.total || 0;
        const totalWithdraw = totalWithdrawResult[0]?.total || 0;
        const totalBalance = totalBalanceResult[0]?.total || 0;
        const thisMonthDeposits = thisMonthDepositsResult[0]?.total || 0;
        const lastMonthDeposits = lastMonthDepositsResult[0]?.total || 0;
        const thisMonthWithdraws = thisMonthWithdrawsResult[0]?.total || 0;
        const lastMonthWithdraws = lastMonthWithdrawsResult[0]?.total || 0;

        // Calculate growth percentages
        const userGrowth = calculateGrowth(thisMonthNewUsers, lastMonthNewUsers);
        const depositGrowth = calculateGrowth(thisMonthDeposits, lastMonthDeposits);
        const withdrawGrowth = calculateGrowth(thisMonthWithdraws, lastMonthWithdraws);
        const bettingGrowth = calculateGrowth(thisMonthBetting, lastMonthBetting);

        // Monthly data for charts
        const monthlyData = await getMonthlyData(transactionQuery);

        const stats = {
            totalUsers,
            onlineUsers,
            thisMonthNewUsers,
            lastMonthNewUsers,
            totalDeposit,
            totalWithdraw,
            totalBalance,
            thisMonthDeposits,
            lastMonthDeposits,
            thisMonthWithdraws,
            lastMonthWithdraws,
            thisMonthBetting,
            lastMonthBetting,
            monthlyData,
            growth: {
                userGrowth,
                depositGrowth,
                withdrawGrowth,
                bettingGrowth
            }
        };

        console.log('Dashboard stats calculated:', {
            totalUsers,
            totalDeposit,
            totalWithdraw,
            userGrowth,
            depositGrowth
        });

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const userId = req.user;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'Agent') {
            query = { referredBy: req.user.referralCode };
        } else if (userRole === 'subagent') {
            query = { referredBy: req.user.referralCode };
        }

        // Get recent transactions, users, and other activities
        const [recentTransactions, recentUsers, recentLogins] = await Promise.all([
            Transaction.find(query)
                .populate('user', 'username email')
                .sort({ createdAt: -1 })
                .limit(10),
            User.find(query)
                .select('username email createdAt status')
                .sort({ createdAt: -1 })
                .limit(5),
            User.find({ ...query, lastLogin: { $ne: null } })
                .select('username lastLogin')
                .sort({ lastLogin: -1 })
                .limit(5)
        ]);

        const recentActivity = {
            transactions: recentTransactions,
            newUsers: recentUsers,
            recentLogins
        };

        res.json({
            success: true,
            data: recentActivity
        });

    } catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity'
        });
    }
};

exports.getUserList = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'Agent') {
            query = { referredBy: req.user.referralCode };
        } else if (userRole === 'SubAgent') {
            query = { referredBy: req.user.referralCode };
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            select: 'username email balance status createdAt lastLogin'
        };

        const users = await User.paginate(query, options);

        res.json({
            success: true,
            data: users.docs,
            pagination: {
                page: users.page,
                limit: users.limit,
                total: users.totalDocs,
                pages: users.totalPages
            }
        });

    } catch (error) {
        console.error('User list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user list'
        });
    }
};

exports.getAgentList = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const agents = await Agent.paginate(
            {},
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                select: 'username email balance status createdAt totalUsers'
            }
        );

        res.json({
            success: true,
            data: agents.docs,
            pagination: {
                page: agents.page,
                limit: agents.limit,
                total: agents.totalDocs,
                pages: agents.totalPages
            }
        });

    } catch (error) {
        console.error('Agent list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent list'
        });
    }
};

exports.getSubAgentList = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'Agent') {
            query = { referredBy: req.user.referralCode };
        }

        const subAgents = await SubAgent.paginate(
            query,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                select: 'username email balance status createdAt agent totalUsers',
                populate: 'agent'
            }
        );

        res.json({
            success: true,
            data: subAgents.docs,
            pagination: {
                page: subAgents.page,
                limit: subAgents.limit,
                total: subAgents.totalDocs,
                pages: subAgents.totalPages
            }
        });

    } catch (error) {
        console.error('SubAgent list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subagent list'
        });
    }
};

exports.getPendingDeposits = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;

        let query = { type: 0, status: 0 }; // Deposit and pending

              const referralCode = req.user.referralCode;
        // Withdrawal and pending

        if (userRole === 'Agent') {
            query.referredBy = referralCode;
        } else if (userRole === 'SubAgent') {
            query.referredBy = referralCode;
        }

        const transactions = await Transaction.paginate(
            query,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                populate: 'user'
            }
        );

        res.json({
            success: true,
            transactions: transactions.docs,
            total: transactions.totalDocs,
            pagination: {
                page: transactions.page,
                limit: transactions.limit,
                pages: transactions.totalPages
            }
        });

    } catch (error) {
        console.error('Pending deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending deposits'
        });
    }
};

exports.getPendingWithdrawals = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        let query = { type: 1, status: 0 };
        const userId = req.user.id;
        const userRole = req.user.role;
        const referralCode = req.user.referralCode;
        // Withdrawal and pending

        if (userRole === 'Agent') {
            query.referredBy = referralCode;
        } else if (userRole === 'SubAgent') {
            query.referredBy = referralCode;
        }

        const transactions = await Transaction.paginate(
            query,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                populate: 'user'
            }
        );

        res.json({
            success: true,
            transactions: transactions.docs,
            total: transactions.totalDocs,
            pagination: {
                page: transactions.page,
                limit: transactions.limit,
                pages: transactions.totalPages
            }
        });

    } catch (error) {
        console.error('Pending withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending withdrawals'
        });
    }
};

exports.getRecentTransactions = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const referralCode = req.user.referralCode;
        // Withdrawal and pending

        if (userRole === 'Agent') {
            query.referredBy = referralCode;
        } else if (userRole === 'SubAgent') {
            query.referredBy = referralCode;
        }

        const transactions = await Transaction.find(query)
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error('Recent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent transactions'
        });
    }
};

// Helper functions
function calculateGrowth(current, previous) {
    if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
    }
    const growth = ((current - previous) / previous) * 100;
    return Math.round(growth * 100) / 100; // Round to 2 decimal places
}

async function getMonthlyData(transactionQuery) {
    try {
        const months = [];
        const now = new Date();

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(month);
        }

        const monthlyDeposits = await Promise.all(
            months.map(async (month) => {
                const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
                const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

                const result = await Transaction.aggregate([
                    {
                        $match: {
                            ...transactionQuery,
                            type: 0,
                            status: 1,
                            createdAt: {
                                $gte: startOfMonth,
                                $lte: endOfMonth
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                return result[0]?.total || 0;
            })
        );

        return monthlyDeposits;
    } catch (error) {
        console.error('Error in getMonthlyData:', error);
        return Array(12).fill(0);
    }
}