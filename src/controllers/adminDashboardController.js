const User = require('../models/User');
const Admin = require('../models/Admin');
const DashboardStats = require('../models/DashboardStats');
const BettingHistory = require('../models/BettingHistory');
const ReferralBonus = require('../models/ReferralBonus');
const BonusWallet = require('../models/BonusWallet');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('dashboard', 'read')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view dashboard"
      });
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Get or create today's stats
    let stats = await DashboardStats.findOne({ 
      date: { 
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    if (!stats) {
      stats = await updateDashboardStats();
    }

    // User Statistics
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
      createdAt: { 
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    const activeUsersToday = await User.countDocuments({
      lastLoginTime: { 
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    // Financial Statistics
    const users = await User.find({});
    const totalDeposits = users.reduce((sum, user) => sum + (user.totalDeposits || 0), 0);
    const totalWithdrawals = users.reduce((sum, user) => sum + (user.totalWithdrawals || 0), 0);
    
    // Betting Statistics (last 24 hours)
    const bettingStats = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalTurnover: { $sum: "$turnover" },
          totalPayout: { $sum: "$payout" },
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    // Referral Statistics
    const referralStats = await ReferralBonus.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCommission: { $sum: "$commissionAmount" }
        }
      }
    ]);

    // Bonus Statistics
    const bonusStats = await BonusWallet.aggregate([
      {
        $match: {
          status: 'CLAIMED',
          claimedAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          totalBonusGiven: { $sum: "$claimedAmount" }
        }
      }
    ]);

    // Platform Revenue Calculation
    const platformRevenue = (bettingStats[0]?.totalCommission || 0) - 
                          (referralStats[0]?.totalCommission || 0) - 
                          (bonusStats[0]?.totalBonusGiven || 0);

    // Game-wise statistics
    const gameStats = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: "$site",
          totalBets: { $sum: 1 },
          totalTurnover: { $sum: "$turnover" },
          totalPayout: { $sum: "$payout" },
          totalCommission: { $sum: "$commission" }
        }
      },
      { $sort: { totalTurnover: -1 } },
      { $limit: 10 }
    ]);

    // Recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId name email balance createdAt');

    const recentBets = await BettingHistory.find()
      .sort({ start_time: -1 })
      .limit(10)
      .select('member bet_detail turnover bet payout start_time');

    // Chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayStats = await DashboardStats.findOne({
        date: { $gte: startOfDay, $lt: endOfDay }
      });

      chartData.push({
        date: startOfDay.toISOString().split('T')[0],
        newUsers: dayStats?.newUsers || 0,
        totalDeposits: dayStats?.totalDeposits || 0,
        totalTurnover: dayStats?.totalTurnover || 0,
        totalCommission: dayStats?.totalCommissionPaid || 0
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          newUsersToday,
          activeUsersToday,
          totalDeposits,
          totalWithdrawals,
          totalTurnover: bettingStats[0]?.totalTurnover || 0,
          totalPayout: bettingStats[0]?.totalPayout || 0,
          platformRevenue,
          totalCommissionPaid: referralStats[0]?.totalCommission || 0,
          totalBonusGiven: bonusStats[0]?.totalBonusGiven || 0
        },
        gameStats,
        recentUsers,
        recentBets,
        chartData
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};

// Update dashboard stats (called by cron job)
async function updateDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get existing stats or create new
    let stats = await DashboardStats.findOne({ date: today });
    if (!stats) {
      stats = new DashboardStats({ date: today });
    }

    // Calculate statistics
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // User Statistics
    stats.totalUsers = await User.countDocuments();
    stats.newUsers = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    stats.activeUsers = await User.countDocuments({
      lastLoginTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Betting Statistics (for the day)
    const bettingStats = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalTurnover: { $sum: "$turnover" },
          totalPayout: { $sum: "$payout" },
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    if (bettingStats[0]) {
      stats.totalBets = bettingStats[0].totalBets;
      stats.totalTurnover = bettingStats[0].totalTurnover;
      stats.totalPayout = bettingStats[0].totalPayout;
      stats.totalWinLoss = bettingStats[0].totalPayout - bettingStats[0].totalTurnover;
    }

    // Referral Statistics
    const referralStats = await ReferralBonus.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCommission: { $sum: "$commissionAmount" }
        }
      }
    ]);

    if (referralStats[0]) {
      stats.totalReferrals = referralStats[0].totalReferrals;
      stats.referralCommissions = referralStats[0].totalCommission;
    }

    // Game-wise statistics
    const gameWiseStats = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: { site: "$site", product: "$product" },
          totalBets: { $sum: 1 },
          totalTurnover: { $sum: "$turnover" },
          totalPayout: { $sum: "$payout" },
          commission: { $sum: "$commission" }
        }
      }
    ]);

    stats.gameStats = gameWiseStats.map(stat => ({
      gameName: stat._id.site,
      gameType: stat._id.product,
      totalBets: stat.totalBets,
      totalTurnover: stat.totalTurnover,
      totalPayout: stat.totalPayout,
      commission: stat.commission
    }));

    // Hourly breakdown
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startOfDay);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(startOfDay);
      hourEnd.setHours(hour, 59, 59, 999);

      const hourStats = await BettingHistory.aggregate([
        {
          $match: {
            start_time: { $gte: hourStart, $lte: hourEnd }
          }
        },
        {
          $group: {
            _id: null,
            bets: { $sum: 1 },
            turnover: { $sum: "$turnover" }
          }
        }
      ]);

      hourlyData.push({
        hour,
        users: await User.countDocuments({
          lastLoginTime: { $gte: hourStart, $lte: hourEnd }
        }),
        deposits: 0, // You'll need to implement deposit tracking
        bets: hourStats[0]?.bets || 0,
        turnover: hourStats[0]?.turnover || 0
      });
    }

    stats.hourlyStats = hourlyData;

    await stats.save();
    return stats;
  } catch (error) {
    console.error("Update dashboard stats error:", error);
    throw error;
  }
}

// Get user management data
exports.getUserManagement = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('users', 'read')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view users"
      });
    }

    const { 
      page = 1, 
      limit = 50, 
      search, 
      status, 
      role, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'phone.number': { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') filter.isActive = true;
      else if (status === 'inactive') filter.isActive = false;
      else if (status === 'locked') filter.lockUntil = { $gt: new Date() };
      else if (status === 'online') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        filter.onlinestatus = { $gte: fiveMinutesAgo };
      }
    }

    // Role filter
    if (role && role !== 'all') filter.role = role;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(filter)
      .select('-password -resetCode -resetExpiry')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get additional statistics
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      online: await User.countDocuments({ 
        onlinestatus: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      }),
      locked: await User.countDocuments({ lockUntil: { $gt: new Date() } }),
      today: await User.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    };

    res.json({
      success: true,
      data: {
        users,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("User management error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('users', 'read')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view user details"
      });
    }

    const { userId } = req.params;

    const user = await User.findOne({ userId })
      .select('-password -resetCode -resetExpiry -lockUntil -loginAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get betting history
    const bettingHistory = await BettingHistory.find({ member: userId })
      .sort({ start_time: -1 })
      .limit(20);

    // Get deposit/withdrawal history (implement these models)
    // const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 }).limit(20);
    // const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 }).limit(20);

    // Get referral statistics
    const referralStats = {
      level1: user.levelOneReferrals.length,
      level2: user.levelTwoReferrals.length,
      level3: user.levelThreeReferrals.length,
      totalReferrals: user.levelOneReferrals.length + 
                     user.levelTwoReferrals.length + 
                     user.levelThreeReferrals.length
    };

    // Get referral bonuses earned
    const referralBonuses = await ReferralBonus.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get bonus wallets
    const bonusWallets = await BonusWallet.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        bettingHistory,
        referralStats,
        referralBonuses,
        bonusWallets,
        // deposits,
        // withdrawals
      }
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details"
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('users', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update users"
      });
    }

    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const beforeUpdate = user.toObject();

    // Update allowed fields
    const allowedFields = ['name', 'email', 'isActive', 'balance', 'role', 'vipPoints', 'cashReward', 'totalBonus'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    // Update phone if provided
    if (updates.phone) {
      user.phone = updates.phone;
    }

    // Update verification status
    if (updates.isVerified) {
      user.isVerified = { ...user.isVerified, ...updates.isVerified };
    }

    await user.save();

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'UPDATE',
      module: 'users',
      entityId: userId,
      entityType: 'User',
      changes: { before: beforeUpdate, after: user.toObject() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        balance: user.balance,
        role: user.role,
        isVerified: user.isVerified,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
};

// Add balance to user
exports.addUserBalance = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('users', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update user balance"
      });
    }

    const { userId } = req.params;
    const { amount, type, remark } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const beforeUpdate = user.toObject();

    // Add balance
    user.balance += parseFloat(amount);
    
    // Update total bonus if it's a bonus type
    if (type === 'bonus') {
      user.totalBonus += parseFloat(amount);
    }

    await user.save();

    // Create transaction record (implement Transaction model)
    // await Transaction.create({
    //   userId,
    //   type: 'credit',
    //   amount,
    //   balanceBefore: beforeUpdate.balance,
    //   balanceAfter: user.balance,
    //   transactionType: type || 'manual_adjustment',
    //   remark: remark || `Manual adjustment by admin ${req.admin.name}`,
    //   processedBy: req.admin.adminId
    // });

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'BALANCE_ADD',
      module: 'users',
      entityId: userId,
      entityType: 'User',
      changes: { 
        before: { balance: beforeUpdate.balance, totalBonus: beforeUpdate.totalBonus },
        after: { balance: user.balance, totalBonus: user.totalBonus }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Successfully added ৳${amount} to user balance`,
      newBalance: user.balance
    });
  } catch (error) {
    console.error("Add user balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add balance"
    });
  }
};

// Deduct balance from user
exports.deductUserBalance = async (req, res) => {
  try {
    // Check permissions
    if (!req.admin.hasPermission('users', 'update')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to deduct user balance"
      });
    }

    const { userId } = req.params;
    const { amount, remark } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    const beforeUpdate = user.toObject();
    user.balance -= parseFloat(amount);
    await user.save();

    // Create transaction record
    // await Transaction.create({
    //   userId,
    //   type: 'debit',
    //   amount,
    //   balanceBefore: beforeUpdate.balance,
    //   balanceAfter: user.balance,
    //   transactionType: 'manual_deduction',
    //   remark: remark || `Manual deduction by admin ${req.admin.name}`,
    //   processedBy: req.admin.adminId
    // });

    // Log activity
    await AdminActivityLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.name,
      adminRole: req.admin.role,
      action: 'BALANCE_DEDUCT',
      module: 'users',
      entityId: userId,
      entityType: 'User',
      changes: { 
        before: { balance: beforeUpdate.balance },
        after: { balance: user.balance }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Successfully deducted ৳${amount} from user balance`,
      newBalance: user.balance
    });
  } catch (error) {
    console.error("Deduct user balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deduct balance"
    });
  }
};