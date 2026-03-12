const BonusClaim = require('../models/BonusClaim');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

// ==========================================
// Public Bonus Routes
// ==========================================

/**
 * Get available bonuses (public)
 */
exports.getAvailableBonuses = async (req, res) => {
  try {
    // Mock available bonuses - replace with real bonus config
    const availableBonuses = [
      {
        id: 'deposit_100',
        name: '100% Deposit Bonus',
        type: 'deposit',
        amount: '100%',
        minDeposit: 1000,
        maxBonus: 50000,
        wageringReq: 20,
        expiryDays: 30,
        isActive: true
      },
      {
        id: 'welcome_50',
        name: 'Welcome Bonus 50%',
        type: 'welcome',
        amount: '50%',
        minDeposit: 500,
        maxBonus: 25000,
        wageringReq: 25,
        expiryDays: 7,
        isActive: true
      },
      {
        id: 'cashback_10',
        name: 'Daily Cashback 10%',
        type: 'cashback',
        amount: '10%',
        minLoss: 1000,
        maxCashback: 10000,
        wageringReq: 5,
        expiryDays: 1,
        isActive: true
      }
    ];

    res.json({
      success: true,
      data: availableBonuses,
      message: 'Available bonuses retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching available bonuses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available bonuses'
    });
  }
};

// ==========================================
// User Bonus Routes
// ==========================================

/**
 * Get user active bonuses
 */
exports.getUserActiveBonuses = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    // Fetch active bonus claims for user
    const activeBonuses = await BonusClaim.find({
      userId,
      status: { $in: ['active', 'pending'] }
    }).populate('userId', 'username balance').lean();

    res.json({
      success: true,
      data: activeBonuses,
      count: activeBonuses.length
    });
  } catch (error) {
    console.error('Error fetching user active bonuses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user bonus history
 */
exports.getUserBonusHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const history = await BonusClaim.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching bonus history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user bonus statistics
 */
exports.getBonusStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const userStats = await UserStats.findOne({ userId }).lean();
    const claims = await BonusClaim.find({ userId }).lean();

    const stats = {
      totalClaims: claims.length,
      totalAmount: claims.reduce((sum, claim) => sum + (claim.amount || 0), 0),
      pendingAmount: claims.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0),
      approvedAmount: claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.amount || 0), 0),
      pendingBonus: userStats?.pendingBonus || 0,
      ...(userStats || {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching bonus stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==========================================
// Bonus Processing Routes
// ==========================================

/**
 * Process deposit bonus
 */
exports.processDepositBonus = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { depositAmount, bonusType = 'deposit_100' } = req.body;

    if (!userId || !depositAmount || depositAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and depositAmount required'
      });
    }

    // Calculate bonus (simple 100% match up to max)
    const bonusAmount = Math.min(depositAmount, 50000);
    
    // Create bonus claim
    const bonusClaim = new BonusClaim({
      userId,
      amount: bonusAmount,
      type: 'deposit',
      status: 'active',
      details: {
        depositAmount,
        bonusType,
        wageringReq: 20,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await bonusClaim.save();

    // Update user stats
    const userStats = await UserStats.findOneAndUpdate(
      { userId },
      { $inc: { totalBonuses: bonusAmount, pendingBonus: bonusAmount } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Deposit bonus processed successfully',
      data: {
        bonusClaim,
        bonusAmount,
        userStats
      }
    });
  } catch (error) {
    console.error('Error processing deposit bonus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing deposit bonus'
    });
  }
};

/**
 * Process cashback bonus
 */
exports.processCashback = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { lossAmount } = req.body;

    if (!userId || !lossAmount || lossAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and lossAmount required'
      });
    }

    const cashbackAmount = Math.min(lossAmount * 0.10, 10000); // 10% up to 10k

    const bonusClaim = new BonusClaim({
      userId,
      amount: cashbackAmount,
      type: 'cashback',
      status: 'active',
      details: {
        lossAmount,
        cashbackRate: 0.10,
        wageringReq: 5
      }
    });

    await bonusClaim.save();

    const userStats = await UserStats.findOneAndUpdate(
      { userId },
      { $inc: { totalCashback: cashbackAmount } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Cashback bonus processed',
      data: { bonusClaim, cashbackAmount, userStats }
    });
  } catch (error) {
    console.error('Error processing cashback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Process rebate bonus
 */
exports.processRebate = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { turnoverAmount } = req.body;

    if (!userId || !turnoverAmount || turnoverAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and turnoverAmount required'
      });
    }

    const rebateAmount = turnoverAmount * 0.005; // 0.5% rebate

    const bonusClaim = new BonusClaim({
      userId,
      amount: rebateAmount,
      type: 'rebate',
      status: 'active',
      details: {
        turnoverAmount,
        rebateRate: 0.005,
        wageringReq: 1
      }
    });

    await bonusClaim.save();

    res.json({
      success: true,
      message: 'Rebate bonus processed',
      data: { bonusClaim, rebateAmount }
    });
  } catch (error) {
    console.error('Error processing rebate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Cancel bonus instance
 */
exports.cancelBonus = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user?.userId;

    if (!userId || !instanceId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and instanceId required'
      });
    }

    const bonusClaim = await BonusClaim.findOneAndUpdate(
      { _id: instanceId, userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!bonusClaim) {
      return res.status(404).json({
        success: false,
        message: 'Bonus not found or unauthorized'
      });
    }

    // Return to pending bonus if cancelled
    await UserStats.findOneAndUpdate(
      { userId },
      { $inc: { pendingBonus: bonusClaim.amount } }
    );

    res.json({
      success: true,
      message: 'Bonus cancelled successfully',
      data: bonusClaim
    });
  } catch (error) {
    console.error('Error cancelling bonus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Existing methods (kept as-is)
exports.claimBonus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, type } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bonus amount"
      });
    }

    // Check if user has pending bonus
    const pendingClaim = await BonusClaim.findOne({
      userId,
      status: 'pending'
    });

    if (pendingClaim) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending bonus claim"
      });
    }

    // Get user stats to check eligibility
    const userStats = await UserStats.findOne({ userId });
    if (!userStats || userStats.pendingBonus < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient bonus amount available"
      });
    }

    // Create bonus claim
    const bonusClaim = new BonusClaim({
      userId,
      amount,
      type: type || 'rebate',
      status: 'pending',
      details: {
        invitedFriends: userStats.totalFriendsInvited,
        completedFriends: userStats.totalFriendsCompleted,
        turnoverAmount: 0,
        depositAmount: 0
      }
    });

    await bonusClaim.save();

    // Update user stats
    userStats.pendingBonus -= amount;
    await userStats.save();

    res.json({
      success: true,
      message: "Bonus claim submitted successfully",
      data: {
        claimId: bonusClaim._id,
        amount: bonusClaim.amount,
        type: bonusClaim.type,
        status: bonusClaim.status,
        submittedAt: bonusClaim.createdAt
      }
    });

  } catch (error) {
    console.error("Error claiming bonus:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getClaimHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, type, startDate, endDate } = req.query;

    let query = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const claims = await BonusClaim.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: claims
    });

  } catch (error) {
    console.error("Error getting claim history:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.processBonusClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { action, notes } = req.body;
    const adminId = req.user.userId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can process bonus claims"
      });
    }

    const claim = await BonusClaim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Bonus claim not found"
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Claim already processed"
      });
    }

    if (action === 'approve') {
      claim.status = 'approved';
      claim.approvedBy = adminId;
      claim.approvedAt = new Date();
      claim.notes = notes;

      const user = await User.findOne({ userId: claim.userId });
      if (user) {
        await user.addBalance(claim.amount);
      }

      await claim.save();

      res.json({
        success: true,
        message: "Bonus claim approved and credited",
        data: claim
      });

    } else if (action === 'reject') {
      claim.status = 'rejected';
      claim.approvedBy = adminId;
      claim.approvedAt = new Date();
      claim.notes = notes;

      const userStats = await UserStats.findOne({ userId: claim.userId });
      if (userStats) {
        userStats.pendingBonus += claim.amount;
        await userStats.save();
      }

      await claim.save();

      res.json({
        success: true,
        message: "Bonus claim rejected",
        data: claim
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action"
      });
    }

  } catch (error) {
    console.error("Error processing bonus claim:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

