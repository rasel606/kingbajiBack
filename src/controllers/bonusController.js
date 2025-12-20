const BonusClaim = require('../models/BonusClaim');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

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
        turnoverAmount: 0, // You can add actual turnover calculation
        depositAmount: 0   // You can add actual deposit calculation
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

    // Apply filters
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
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.userId;

    // Check if user is admin
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
      // Approve claim and credit user balance
      claim.status = 'approved';
      claim.approvedBy = adminId;
      claim.approvedAt = new Date();
      claim.notes = notes;

      // Credit user's balance
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
      // Reject claim and return bonus to pending
      claim.status = 'rejected';
      claim.approvedBy = adminId;
      claim.approvedAt = new Date();
      claim.notes = notes;

      // Return bonus to user's pending balance
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