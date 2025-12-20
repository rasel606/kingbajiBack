const User = require('../models/User');
const ReferralBonus = require('../models/ReferralBonus');
const BonusWallet = require('../models/BonusWallet');

// Get referral dashboard data
exports.getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate today's date range
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Calculate yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    // Get today's rebate
    const todayRebate = await ReferralBonus.aggregate([
      {
        $match: {
          userId: userId,
          status: 'paid',
          createdAt: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);

    // Get yesterday's rebate
    const yesterdayRebate = await ReferralBonus.aggregate([
      {
        $match: {
          userId: userId,
          status: 'paid',
          createdAt: { $gte: startOfYesterday, $lte: endOfYesterday }
        }
      },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);

    // Get completed referrals (users who have deposited and bet)
    const completedReferrals = await User.aggregate([
      {
        $match: {
          referredBy: user.referralCode,
          balance: { $gte: 2000 } // Minimum deposit requirement
        }
      },
      {
        $lookup: {
          from: 'bettinghistories',
          localField: 'userId',
          foreignField: 'member',
          as: 'bets'
        }
      },
      {
        $match: {
          $expr: {
            $gte: [{ $sum: "$bets.turnover" }, 5000] // Minimum turnover
          }
        }
      }
    ]);

    // Get claimable bonus
    const claimableBonus = await BonusWallet.aggregate([
      {
        $match: {
          userId: userId,
          status: 'ACTIVE',
          locked: false,
          balance: { $gt: 0 }
        }
      },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    // Get referral details
    const referralDetails = await ReferralBonus.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        invitationUrl: `http://yourdomain.com/register?ref=${user.referralCode}`,
        stats: {
          friendsInvited: user.levelOneReferrals.length,
          friendsCompleted: completedReferrals.length,
          todayRebate: todayRebate[0]?.total || 0,
          yesterdayRebate: yesterdayRebate[0]?.total || 0,
          totalEarnings: user.cashReward || 0
        },
        claimableBonus: claimableBonus[0]?.total || 0,
        referralDetails: referralDetails
      }
    });
  } catch (error) {
    console.error("Referral dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get referral history
exports.getReferralHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: userId };
    
    if (type && type !== 'all') filter.bonusType = type;
    if (status && status !== 'all') filter.status = status;

    const referrals = await ReferralBonus.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReferralBonus.countDocuments(filter);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Referral history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Claim referral bonus
exports.claimReferralBonus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const bonusId = req.params.bonusId;

    // Find the bonus wallet
    const bonusWallet = await BonusWallet.findOne({
      userId: userId,
      bonusId: bonusId,
      status: 'ACTIVE',
      locked: false,
      balance: { $gt: 0 }
    }).session(session);

    if (!bonusWallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "No claimable bonus found"
      });
    }

    // Update user balance
    await User.findOneAndUpdate(
      { userId: userId },
      { 
        $inc: { 
          balance: bonusWallet.balance,
          cashReward: bonusWallet.balance 
        }
      },
      { session }
    );

    // Update bonus wallet
    bonusWallet.claimedAmount += bonusWallet.balance;
    bonusWallet.balance = 0;
    bonusWallet.status = 'CLAIMED';
    bonusWallet.claimedAt = new Date();
    await bonusWallet.save({ session });

    // Create transaction record
    await BonusWalletTransaction.create([{
      userId: userId,
      walletType: 'BONUS',
      type: 'CREDIT',
      amount: bonusWallet.balance,
      balanceBefore: bonusWallet.balance,
      balanceAfter: 0,
      ref: `CLAIM_${bonusId}`,
      remark: `Claimed ${bonusWallet.bonusType} bonus`
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Successfully claimed ৳ ${bonusWallet.balance} bonus!`,
      newBalance: bonusWallet.balance
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Claim bonus error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to claim bonus"
    });
  } finally {
    session.endSession();
  }
};